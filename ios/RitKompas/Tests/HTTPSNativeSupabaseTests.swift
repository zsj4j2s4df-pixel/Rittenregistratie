import Foundation
import XCTest
@testable import RitKompasCore

private final class AuthFixtureState: @unchecked Sendable {
    let lock = NSLock()
    private var fixtures: [String: (Int, String, [String: String])] = [:]
    private var seen: [String: URLRequest] = [:]
    func install(_ host: String, status: Int, body: String, headers: [String: String]) { lock.lock(); defer { lock.unlock() }; fixtures[host] = (status,body,headers) }
    func read(_ request: URLRequest) -> (Int,String,[String:String])? { lock.lock(); defer { lock.unlock() }; guard let host=request.url?.host else {return nil}; seen[host]=request; return fixtures[host] }
    func remove(_ host: String) -> URLRequest? { lock.lock(); defer { lock.unlock() }; fixtures.removeValue(forKey:host); return seen.removeValue(forKey:host) }
}
private final class AuthURLProtocol: URLProtocol, @unchecked Sendable {
    static let state = AuthFixtureState()
    override class func canInit(with request: URLRequest) -> Bool { true }
    override class func canonicalRequest(for request: URLRequest) -> URLRequest { request }
    override func startLoading() {
        guard let (status,body,headers)=Self.state.read(request), let url=request.url,
              let response=HTTPURLResponse(url:url,statusCode:status,httpVersion:"HTTP/1.1",headerFields:headers) else { client?.urlProtocol(self,didFailWithError:URLError(.cannotLoadFromNetwork)); return }
        client?.urlProtocol(self,didReceive:response,cacheStoragePolicy:.notAllowed)
        client?.urlProtocol(self,didLoad:Data(body.utf8)); client?.urlProtocolDidFinishLoading(self)
    }
    override func stopLoading() {}
}
final class HTTPSNativeSupabaseTests: XCTestCase {
    private func probe(status: Int = 200, body: String, extra: [String:String] = [:], action: String = "provider") async throws -> (String,URLRequest?) {
        let host="auth-"+UUID().uuidString.lowercased()+".example.invalid", origin=try APIOrigin("https://"+host)
        AuthURLProtocol.state.install(host,status:status,body:body,headers:["Content-Type":"application/json","Cache-Control":"no-store"].merging(extra){_,b in b})
        let config=URLSessionConfiguration.ephemeral; config.protocolClasses=[AuthURLProtocol.self]
        let transport=HTTPSNativeSupabaseTransport(configuration:config)
        do {
            let value: String
            if action=="provider" { value=try await transport.provider(origin:origin,accessHeaders:[:]).rawValue }
            else {
                let names=["__Host-ritkompas-session","__Host-ritkompas-binding","__Host-ritkompas-refresh","__Host-ritkompas-remember"]
                let cookies=try NativeSupabaseCookies(origin:origin,cookies:names.map{ HTTPCookie(properties:[.name:$0,.value:$0==names[3] ? "no":"synthetic",.domain:host,.path:"/",.secure:"TRUE",HTTPCookiePropertyKey("HttpOnly"):"TRUE"])! })
                if action=="refresh" { let rotation=try await transport.refresh(origin:origin,cookies:cookies); value=try rotation.cookies.headers(for:origin)["Cookie"]! }
                else { try await transport.logout(origin:origin,cookies:cookies); value="logout" }
            }
            await transport.close(); return (value,AuthURLProtocol.state.remove(host))
        } catch { await transport.close(); _=AuthURLProtocol.state.remove(host); throw error }
    }
    func testExplicitProviderStatusAndNoUnknownFallback() async throws {
        let a=try await probe(body:#"{"provider":"supabase","authenticated":false}"#)
        XCTAssertEqual(a.0,"supabase"); XCTAssertEqual(a.1?.httpMethod,"GET"); XCTAssertEqual(a.1?.url?.path,"/api/auth/status")
        let b=try await probe(status:503,body:#"{"provider":"access"}"#); XCTAssertEqual(b.0,"access")
        for (status,body) in [(200,#"{"provider":"other"}"#),(503,#"{"provider":"supabase"}"#),(200,"<html>login</html>")] {
            do { _=try await probe(status:status,body:body); XCTFail("fallback") } catch {}
        }
    }
    func testRealCookieRotationParsingAndMinimalPost() async throws {
        let names=["__Host-ritkompas-session","__Host-ritkompas-binding","__Host-ritkompas-refresh","__Host-ritkompas-remember"]
        let set=names.map{ $0+"="+($0==names[3] ? "no":"rotated")+"; Path=/; Secure; HttpOnly; SameSite=Strict" }.joined(separator:", ")
        let (value,request)=try await probe(body:#"{"viewerId":"u","expiresAt":2000000000000}"#,extra:["Set-Cookie":set],action:"refresh")
        XCTAssertTrue(value.contains("rotated")); XCTAssertFalse(value.contains(names[2]))
        XCTAssertEqual(request?.httpMethod,"POST"); XCTAssertEqual(request?.url?.path,"/api/auth/refresh")
        XCTAssertEqual(request?.value(forHTTPHeaderField:"Origin"),"https://"+request!.url!.host!)
        XCTAssertEqual(request?.value(forHTTPHeaderField:"x-csrf-protection"),"1")
    }
    func testMissingRotatedBindingRedirectAndBadLogoutFail() async throws {
        do { _=try await probe(body:#"{"viewerId":"u","expiresAt":2000000000000}"#,action:"refresh"); XCTFail("missing cookies") } catch {}
        do { _=try await probe(status:302,body:"{}",extra:["Location":"https://other.invalid"]); XCTFail("redirect") } catch {}
        do { _=try await probe(body:#"{"providerRevoked":false}"#,action:"logout"); XCTFail("revocation hidden") } catch {}
        let (value,_)=try await probe(body:#"{"providerRevoked":true}"#,action:"logout"); XCTAssertEqual(value,"logout")
    }
}
