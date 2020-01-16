#!/usr/local/bin/python
# -*- coding: utf-8 -*-

# imports
import sqlite3
import os
import sys
import json

# setting
database_path = 'xxxxxxxxxx.sqlite'
limit_max = 100
offset_max = 999

# entry
try:
    if os.environ['REQUEST_METHOD'] != 'POST':
        # 直アクセス禁止
        raise

    # ヘッダ出力
    print('Content-Type: text/plain; charset=utf-8')
    print('')

    # limit/offset取得
    js_read = sys.stdin.read().decode('utf-8')
    py_obj = json.loads(js_read)
    limit = py_obj['limit']
    offset = py_obj['offset']

    if limit > limit_max or offset > offset_max:
        raise

    if limit + offset > offset_max:
        limit = offset_max - offset

    # データベース接続（共有ロック）
    con = sqlite3.connect(database_path, isolation_level='DEFERRED')
    try:
        # 最近のデータを取得
        query = 'select KEY, INSERT_DATE from SAVE_MODULE order by ID desc limit ? offset ?'
        cur = con.execute(query, (limit, offset,))

        try:
            recent_key_list = []
            recent_date_list = []
            for row in cur:
                recent_key_list.append(row[0])
                recent_date_list.append(row[1])

            json_recent = json.dumps({'recent_key':recent_key_list, 'recent_date':recent_date_list})
        except:
            json_recent = ''

        # 結果出力
        print(json_recent.encode('utf-8'))

    except:
        pass
    finally:
        # データベースを閉じる
        con.close()
except:
    pass
