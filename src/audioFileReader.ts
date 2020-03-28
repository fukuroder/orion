/**
 * オーディオファイル読み込み.
 * @author fukuroda
 */
class AudioFileReader{
    /**
     * デコード完了時の処理.
     */
    private decodeFinished:DecodeSuccessCallback;

    /**
     * デコード失敗時の処理.
     */
    private decodeError:DecodeErrorCallback;

    /**
     * constructor.
     * @param decodeFinished デコード完了時の処理
     * @param decodeError デコード失敗時の処理
     */
    public constructor(decodeFinished:DecodeSuccessCallback, decodeError:DecodeErrorCallback){
        this.decodeFinished = decodeFinished;
        this.decodeError = decodeError;
    }

    /**
     * wav/oggファイルロード完了後の処理.
     * @param loaded_evt ロード完了イベント
     */
    private loadFinished = (loaded_evt:ProgressEvent<FileReader>) => {
        // AudioContext作成
        var audio_context:AudioContext = new AudioContext();

        // wav/oggデコード
        audio_context.decodeAudioData(
            loaded_evt.target!.result as ArrayBuffer,
            this.decodeFinished,
            this.decodeError);
    }

    /**
     * wav/oggファイルロード.
     * @param audio_file オーディオファイル
     */
    public load(audio_file:File):void{
        // FileReader作成
        var reader:FileReader = new FileReader();

        // ロード完了時の処理を指定
        reader.onload = this.loadFinished;

        // ロード開始
        reader.readAsArrayBuffer(audio_file);
    }
}

export{AudioFileReader}