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
    public static load(name_list:string[], Image_Loaded:(_:Map<string,HTMLImageElement>)=>void){
        var loaded_image_prop = new Map<string, HTMLImageElement>();
        var loaded_image_count:number = 0;

        for (var a of name_list){
            loaded_image_prop.set(a, new Image());
            loaded_image_prop.get(a)!.onload = (e:Event)=>{
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
            loaded_image_prop.get(a)!.src = 'img/' + a + '.png';
        }
    }
}

export{ImageLoader}
