#!/usr/local/bin/python
# -*- coding: utf-8 -*-

# imports
import sqlite3
import string
import random
import os
import sys

# setting
database_path = 'xxxxxxxxxx.sqlite'

# entry
try:
    if os.environ['REQUEST_METHOD'] != 'POST':
        # 直アクセス禁止
        raise

    print('Content-Type: text/plain; charset=utf-8')
    print('')
    # JSON文字列取得
    save_data = sys.stdin.read().decode('utf-8')

    # データベース接続（更新ロック）
    con = sqlite3.connect(database_path, isolation_level='IMMEDIATE')
    try:

        # 新しいKEYが重複していないか念のためチェック
        while True:
            # 新しいKEY生成
            new_key = ''.join(random.sample(string.digits + string.letters, 10))

            # 重複チェック
            query = 'select KEY from SAVE_MODULE where KEY=?'
            cur = con.execute(query, (new_key,))
            row = cur.fetchone()
            if row == None:
                break
                
        # insert
        query = 'insert into SAVE_MODULE(KEY,SAVE_DATA) values(?,?)'
        cur = con.execute(query, (new_key, save_data))

        # commit
        con.commit()

        print(new_key.encode('utf-8'))
    except sqlite3.Error:
        pass
    finally:
        # データベースを閉じる
        con.close()
except:
    pass
