// Shared exact arithmetic for browser previews and durable server reports.
export function milliKm(distance: number): number {
 const value=Math.round(distance*1000);
 if(!Number.isFinite(distance)||distance<0||!Number.isSafeInteger(value)||Math.abs(value/1000-distance)>1e-9)throw new Error('Rapportafstand ondersteunt maximaal drie decimalen en moet veilig berekenbaar zijn.');
 return value;
}
export function reimbursementCents(distance:number,micros:number):number {
 if(!Number.isSafeInteger(micros)||micros<0||micros>1_000_000_000)throw new Error('Ongeldig tarief.');
 const value=Number((BigInt(milliKm(distance))*BigInt(micros)+BigInt(5_000_000))/BigInt(10_000_000));
 if(!Number.isSafeInteger(value))throw new Error('Vergoeding valt buiten het veilig berekenbare bereik.');
 return value;
}
