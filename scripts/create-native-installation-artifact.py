"""Create a portable, credential-free native installation guide in PDF and HTML."""
import base64
import html
import json
import re
import sys
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

root = Path(__file__).resolve().parents[1]
out = Path(sys.argv[1]).resolve()
(out / 'pdf').mkdir(parents=True, exist_ok=True)
data = json.loads((root / 'docs/installatie/native-installation.json').read_text())
logo = root / 'public/brand/ritkompas-mark-approved.png'
pdfmetrics.registerFont(TTFont('RK', '/System/Library/Fonts/Supplemental/Arial.ttf'))
pdfmetrics.registerFont(TTFont('RK-Bold', '/System/Library/Fonts/Supplemental/Arial Bold.ttf'))
pdfmetrics.registerFontFamily('RK', normal='RK', bold='RK-Bold', italic='RK', boldItalic='RK-Bold')
bg, panel, ink, muted, line = map(HexColor, ['#EDE3D1', '#FAF2E3', '#242B29', '#58605B', '#CBBCA2'])
styles = {
    'title': ParagraphStyle('title', fontName='RK-Bold', fontSize=21, leading=25, textColor=ink, spaceAfter=8),
    'intro': ParagraphStyle('intro', fontName='RK', fontSize=10, leading=13, textColor=muted, spaceAfter=10),
    'heading': ParagraphStyle('heading', fontName='RK-Bold', fontSize=11.5, leading=14, textColor=ink, spaceAfter=6),
    'body': ParagraphStyle('body', fontName='RK', fontSize=10, leading=13, textColor=ink, spaceAfter=4),
}
width, height = 595.28, 841.89
content_width = width - 64
def frame(c, doc):
    c.setFillColor(bg); c.rect(0, 0, width, height, fill=1, stroke=0)
    c.drawImage(str(logo), 38, height-61, 32, 32, mask='auto')
    c.setFillColor(ink); c.setFont('RK-Bold', 11); c.drawString(80, height-42, 'RitKompas | Echte iPhone-app')
    c.setFont('RK', 8); c.setFillColor(muted); c.drawString(38, 24, 'Voorbereiding - geen downloadlink of bewijs van installatie | '+data['date'])
    c.drawRightString(width-38, 24, f'{doc.page} / {len(data["pages"])}')
def card(item):
    blocks=[Paragraph(item['title'], styles['heading'])]
    blocks.extend(Paragraph(text, styles['body']) for text in item['lines'])
    table=Table([[blocks]], colWidths=[content_width], cornerRadii=[12,12,12,12])
    table.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),panel),('BOX',(0,0),(-1,-1),.6,line),('LEFTPADDING',(0,0),(-1,-1),12),('RIGHTPADDING',(0,0),(-1,-1),12),('TOPPADDING',(0,0),(-1,-1),9),('BOTTOMPADDING',(0,0),(-1,-1),6)]))
    return [table, Spacer(1,8)]
story=[]
for i, page in enumerate(data['pages']):
    if i: story.append(PageBreak())
    story.extend([Paragraph(page['title'], styles['title']), Paragraph(page['intro'], styles['intro'])])
    for item in page['cards']: story.extend(card(item))
pdf_path=out/'pdf/RitKompas-echte-iPhone-app-installatie.pdf'
SimpleDocTemplate(str(pdf_path), pagesize=(width,height), rightMargin=32,leftMargin=32,topMargin=72,bottomMargin=42,title=data['title'],author='RitKompas').build(story,onFirstPage=frame,onLaterPages=frame)

# The same content becomes a self-contained mobile artifact, not a hosted webapp.
encoded=base64.b64encode(logo.read_bytes()).decode()
parts=[]
for n,page in enumerate(data['pages'],1):
    cards=[]
    for item in page['cards']:
        lines=[]
        for text in item['lines']:
            text=re.sub(r"<link href='([^']+)'>",r'<a href="\1">',text).replace('</link>','</a>')
            if text.startswith('[ ] '): text='<label><input type="checkbox">'+text[4:]+'</label>'
            lines.append('<p>'+text+'</p>')
        cards.append('<article><h3>'+item['title']+'</h3>'+''.join(lines)+'</article>')
    parts.append(f'<section id="deel-{n}"><span class="number">{n}</span><h2>{page["title"]}</h2><p class="intro">{page["intro"]}</p>'+''.join(cards)+'</section>')
html_path=out/'RitKompas-echte-iPhone-app-installatie.html'
html_path.write_text('''<!doctype html><html lang="nl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>RitKompas - echte iPhone-app installeren</title><style>p{overflow-wrap:anywhere}header>div{min-width:0}
*{box-sizing:border-box}body{margin:0;background:#EDE3D1;color:#242B29;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif;line-height:1.65}main{max-width:860px;margin:auto;padding:32px 22px}header{display:flex;gap:20px;align-items:center;margin-bottom:26px}header img{width:76px;height:76px;border-radius:18px}h1{font-size:32px;line-height:1.15;margin:0 0 8px}h2{font-size:27px;line-height:1.25}h3{font-size:19px;margin:0 0 12px}h1,h2,h3{overflow-wrap:anywhere}p{margin:0 0 12px;font-size:16px}article{border:1px solid #CBBCA2;border-radius:22px;background:#FAF2E3;padding:24px;margin:0 0 18px}section{margin:34px 0 52px}.intro,footer{color:#58605B}.number{display:grid;place-items:center;width:46px;height:46px;background:#404A47;color:#FAF2E3;border-radius:13px;font-size:23px;font-weight:700}a{color:#404A47;text-underline-offset:3px;overflow-wrap:anywhere}nav{display:flex;gap:8px;flex-wrap:wrap}nav a{padding:10px 15px;border:1px solid #CBBCA2;background:#FAF2E3;border-radius:12px;min-height:44px}label{display:flex;gap:12px;align-items:flex-start;min-height:44px}input{width:22px;height:22px;flex-shrink:0;margin-top:3px;accent-color:#404A47}small{font-size:13px}@media(max-width:500px){h1{font-size:27px}header{gap:14px}header img{width:64px;height:64px}article{padding:21px}}@media print{nav{display:none}body{background:white}section{break-before:page}article{break-inside:avoid}a{color:black}}
</style><main><header><img alt="" src="data:image/png;base64,'''+encoded+'''"><div><h1>RitKompas op 3 iPhones</h1><p>De echte iPhone-testapp - installatie en instellingen</p><small>24 oktober 2026 - geen webapp-installatie</small></div></header><nav aria-label="Onderdelen"><a href="#deel-1">Gereed?</a><a href="#deel-2">Installeren</a><a href="#deel-3">Instellingen</a><a href="#deel-4">Eerste start</a><a href="#deel-5">Testlijst</a></nav>'''+''.join(parts)+'''<footer><p>De vinkjes in dit document zijn alleen een lokale checklist. Ze veranderen geen iPhone-instellingen en worden niet opgeslagen of verzonden.</p><p>Dit artifact is geen app, IPA of TestFlight-link. Beveiliging, kosten en productiedata zijn niet gewijzigd.</p></footer></main></html>''')
print(pdf_path)
print(html_path)
