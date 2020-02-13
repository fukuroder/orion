class RecentLoader {
    constructor() {
        this.limit = 20;
        this.recent_offset = 0;
    }
    get_recent_backward() {
        var recent_offset = this.recent_offset - this.limit >= 0 ? this.recent_offset - this.limit : 0;
        return this.get_recent(recent_offset);
    }
    get_recent_forward() {
        var recent_offset = this.recent_offset + this.limit;
        return this.get_recent(recent_offset);
    }
    get_recent(recent_offset) {
        var json_send_str = JSON.stringify({ limit: this.limit, offset: recent_offset });
        var request = new XMLHttpRequest();
        request.open('POST', 'recent.cgi', false);
        request.send(json_send_str);
        if (request.status == 200) {
            if (request.response.length > 0) {
                try {
                    var json_obj = JSON.parse(request.response);
                    var key_arr = json_obj.recent_key;
                    var date_arr = json_obj.recent_date;
                    if (key_arr.length > 0) {
                        var recent_select = [];
                        for (var i = 0; i < key_arr.length; i++) {
                            recent_select.push({ html: (recent_offset + i + 1).toString() + ' | ' + date_arr[i] + ' | #' + key_arr[i], value: key_arr[i] });
                        }
                        var recent_range = (recent_offset + 1).toString() + '-' + (recent_offset + key_arr.length).toString();
                        this.recent_offset = recent_offset;
                        return { recent_select: recent_select, recent_range: recent_range };
                    }
                }
                catch (e) {
                }
            }
        }
        return null;
    }
}
export { RecentLoader };
