package ;
import js.html.audio.AudioContext;
import js.html.File;
import js.html.FileReader;

/**
 * オーディオファイル読み込み.
 * @author fukuroda
 */
class AudioFileReader{
    /**
     * デコード完了時の処理.
     */
    var decodeFinished:Dynamic;

    /**
     * デコード失敗時の処理.
     */
    var decodeError:Dynamic;

    /**
     * constructor.
     * @param decodeFinished デコード完了時の処理
     * @param decodeError デコード失敗時の処理
     */
    public function new(decodeFinished, decodeError):Void{
        this.decodeFinished = decodeFinished;
        this.decodeError = decodeError;
    }

    /**
     * wav/oggファイルロード完了後の処理.
     * @param loaded_evt ロード完了イベント
     */
    function loadFinished(loaded_evt):Void{
        // AudioContext作成
        var audio_context:AudioContext = new AudioContext();

        // wav/oggデコード
        audio_context.decodeAudioData(
            loaded_evt.target.result,
            this.decodeFinished,
            this.decodeError);
    }

    /**
     * wav/oggファイルロード.
     * @param audio_file オーディオファイル
     */
    public function load(audio_file:File):Void{
        // FileReader作成
        var reader:FileReader = new FileReader();

        // ロード完了時の処理を指定
        reader.onload = loadFinished;

        // ロード開始
        reader.readAsArrayBuffer(audio_file);
    }
}
