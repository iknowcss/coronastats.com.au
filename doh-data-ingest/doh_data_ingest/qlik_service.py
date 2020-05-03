import websocket
import ssl
import json


def fetch_hypercube_data(doc_id):
    ws = websocket.create_connection(
        f"wss://covid19-data.health.gov.au/app/{doc_id}",
        sslopt={"cert_reqs": ssl.CERT_NONE},
        header={
            'Host': 'covid19-data.health.gov.au',
            'Connection': 'Upgrade',
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.129 Safari/537.36',
            'Upgrade': 'websocket',
            'Origin': 'https://www.health.gov.au',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
            # 'Sec-WebSocket-Version': '13',
            # 'Sec-WebSocket-Key': 'unzBGNXuwWCOHNcrqEMVqg==',
            # 'Sec-WebSocket-Extensions': 'permessage-deflate; client_max_window_bits',
        },
    )

    ws.send('{"delta":true,"handle":-1,"method":"OpenDoc","params":["' + doc_id + '","","","",false],"id":1,"jsonrpc":"2.0"}')
    ws.send('{"delta":true,"method":"IsPersonalMode","handle":-1,"params":[],"id":2,"jsonrpc":"2.0"}')
    try:
        result = '{}'
        while result:
            parsed = json.loads(result)
            if parsed.get('id') == 1:
                ws.send('{"delta":true,"method":"IsPersonalMode","handle":-1,"params":[],"id":2,"jsonrpc":"2.0"}')
                ws.send('{"delta":true,"handle":1,"method":"GetAppLayout","params":[],"id":3,"jsonrpc":"2.0"}')
                ws.send('{"delta":true,"handle":1,"method":"GetObject","params":["RHjRJ"],"id":4,"jsonrpc":"2.0"}')
                ws.send('{"delta":true,"handle":1,"method":"CreateSessionObject","params":[{"qInfo":{"qType":"SelectionObject","qId":"MUvXCcz"},"qSelectionObjectDef":{}}],"id":5,"jsonrpc":"2.0"}')
                ws.send('{"delta":true,"handle":1,"method":"CreateSessionObject","params":[{"qInfo":{"qType":"BookmarkList","qId":"MUKGpheB"},"qBookmarkListDef":{"qType":"bookmark","qData":{"title":"/qMetaDef/title","description":"/qMetaDef/description","sheetId":"/sheetId","selectionFields":"/selectionFields","creationDate":"/creationDate"}}}],"id":6,"jsonrpc":"2.0"}')
            elif parsed.get('id') == 4:
                ws.send('{"delta":true,"handle":2,"method":"GetLayout","params":[],"id":7,"jsonrpc":"2.0"}')
            elif parsed.get('id') == 5:
                ws.send('{"delta":true,"handle":3,"method":"GetLayout","params":[],"id":8,"jsonrpc":"2.0"}')
            elif parsed.get('id') == 8:
                ws.send('{"delta":true,"handle":4,"method":"GetLayout","params":[],"id":9,"jsonrpc":"2.0"}')
            elif parsed.get('id') == 7:
                ws.send('{"delta":true,"handle":1,"method":"CreateSessionObject","params":[{"qInfo":{"qId":"AppPropsList","qType":"AppPropsList"},"qAppObjectListDef":{"qType":"appprops","qData":{"sheetTitleBgColor":"/sheetTitleBgColor","sheetTitleGradientColor":"/sheetTitleGradientColor","sheetTitleColor":"/sheetTitleColor","sheetLogoThumbnail":"/sheetLogoThumbnail","sheetLogoPosition":"/sheetLogoPosition","rtl":"/rtl","theme":"/theme"}}}],"id":10,"jsonrpc":"2.0"}')
            elif parsed.get('id') == 10:
                ws.send('{"delta":true,"handle":5,"method":"GetLayout","params":[],"id":11,"jsonrpc":"2.0"}')
            elif parsed.get('id') == 11:
                ws.send('{"delta":true,"handle":1,"method":"GetObject","params":["4ec0cb64-bc5f-4bb2-8de2-5991209f7df7"],"id":12,"jsonrpc":"2.0"}')
            elif parsed.get('id') == 12:
                ws.send('{"delta":true,"handle":6,"method":"GetLayout","params":[],"id":13,"jsonrpc":"2.0"}')
            elif parsed.get('id') == 13:
                ws.send('{"delta":true,"handle":2,"method":"GetHyperCubeData","params":["/qHyperCubeDef",[{"qTop":0,"qLeft":0,"qHeight":9,"qWidth":1},{"qTop":0,"qLeft":1,"qHeight":9,"qWidth":1},{"qTop":0,"qLeft":2,"qHeight":9,"qWidth":1}]],"id":14,"jsonrpc":"2.0"}')
            elif parsed.get('id') == 14:
                ws.close()
                return parsed
            result = ws.recv()
    finally:
        ws.close()
