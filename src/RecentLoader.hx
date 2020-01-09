package ;
import haxe.Json;
import js.html.XMLHttpRequest;

/**
 * Recentデータをロードするクラス.
 * @author fukuroda
 */
class RecentLoader {
    /**
     * 取得する最大数.
     */
    var limit:Int = 20;

    /**
     * TODO.
     */
    var recent_offset:Int = 0;

    /**
     * コンストラクタ.
     */
    public function new () { }

    /**
     * 戻る.
     */
    public function get_recent_backward() {
        var recent_offset:Int = this.recent_offset - this.limit >= 0? this.recent_offset - this.limit : 0;
        return get_recent(recent_offset);
    }

    /**
     *　進む.
     */
    public function get_recent_forward(){
        var recent_offset:Int = this.recent_offset + this.limit;
        return get_recent(recent_offset);
    }

    /**
     *　TODO.
     */
    function get_recent(recent_offset) {
        // 送信文字列作成
        var json_send_str = Json.stringify( { limit:this.limit, offset:recent_offset } );

        // 送信
        var request:XMLHttpRequest = new XMLHttpRequest();
        request.open('POST', 'recent.cgi', false/*同期*/);
        request.send( json_send_str );
        if( request.status == 200 ){
            if( request.response.length > 0 ){
                try{
                    var json_obj = Json.parse(request.response);
                    var key_arr:Array<String> = json_obj.recent_key;
                    var date_arr = json_obj.recent_date;
                    if ( key_arr.length > 0 ) {
                        var recent_select = [];
                        for( i in 0...key_arr.length ){
                            recent_select.push({html:Std.string(recent_offset+i+1) + ' | ' + date_arr[i] + ' | #' + key_arr[i], value:key_arr[i]});
                        }
                        var recent_range = Std.string(recent_offset + 1) + '-' + Std.string(recent_offset + key_arr.length);

                        this.recent_offset = recent_offset;

                        // 成功
                        return { recent_select:recent_select, recent_range:recent_range };
                    }
                }
                catch (e:Dynamic){
                }
            }
        }

        // エラーまたはデータなし
        return null;
    }
}
