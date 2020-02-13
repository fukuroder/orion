class ImageLoader {
    static load(name_list, Image_Loaded) {
        var loaded_image_prop = new Map();
        var loaded_image_count = 0;
        for (var a of name_list) {
            loaded_image_prop.set(a, new Image());
            loaded_image_prop.get(a).onload = (e) => {
                loaded_image_count++;
                if (name_list.length == loaded_image_count) {
                    Image_Loaded(loaded_image_prop);
                }
            };
            loaded_image_prop.get(a).src = 'img/' + a + '.png';
        }
    }
}
export { ImageLoader };
