package ;
import js.html.Image;
import js.html.EventListener;

/**
 * 画像の読み込みクラス.
 * @author fukuroda
 */
class ImageLoader {
    /**
     * ロード開始.
     * @param name_list 名前リスト
     * @param Image_Loaded ロード完了後処理
     */
    public static function load(name_list:Array<String>, Image_Loaded:Map<String,Image> -> Void){
        var loaded_image_prop = new Map<String, Image>();
        var loaded_image_count:Int = 0;

        for (a in name_list){
            loaded_image_prop[a] = new Image();
            loaded_image_prop[a].onload = (e:EventListener)->{
                loaded_image_count++;
                if( name_list.length == loaded_image_count){
                    //--------------------------
                    // 全ての画像のロードが完了
                    //--------------------------

                    // 次の処理
                    Image_Loaded(loaded_image_prop);
                }
            };

            // 画像のパスを指定して読み込み開始
            loaded_image_prop[a].src = 'img/' + a + '.png';
        }
    }
}
