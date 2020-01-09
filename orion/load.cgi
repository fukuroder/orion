#!/usr/local/bin/python
# -*- coding: utf-8 -*-

# imports
import sqlite3
import os
import sys

# setting
database_path = 'xxxxxxxxxx.sqlite'

# entry
try:
    if os.environ['REQUEST_METHOD'] != 'POST':
        # 直アクセス禁止
        raise

    # ヘッダ出力
    print 'Content-Type: text/plain; charset=utf-8'
    print ''

    # ID取得
    save_id = sys.stdin.read().decode('utf-8')

    # データベース接続（共有ロック）
    con = sqlite3.connect(database_path, isolation_level='DEFERRED')
    try:
        # IDに対応するデータを取得
        query = 'select SAVE_DATA from SAVE_MODULE where KEY=?'
        cur = con.execute(query, (save_id,))
        try:
            save_data = cur.fetchone()[0]
        except:
            save_data = ''

        # 結果出力
        if save_data != '':
            print save_data.encode('utf-8')

    except:
        pass
    finally:
        # データベースを閉じる
        con.close()
except:
    pass
