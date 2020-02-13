class AudioFileReader {
    constructor(decodeFinished, decodeError) {
        this.loadFinished = (loaded_evt) => {
            var audio_context = new AudioContext();
            audio_context.decodeAudioData(loaded_evt.target.result, this.decodeFinished, this.decodeError);
        };
        this.decodeFinished = decodeFinished;
        this.decodeError = decodeError;
    }
    load(audio_file) {
        var reader = new FileReader();
        reader.onload = this.loadFinished;
        reader.readAsArrayBuffer(audio_file);
    }
}
export { AudioFileReader };
