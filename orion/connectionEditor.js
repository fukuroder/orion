class ConnectionEditor {
    constructor(canvas) {
        this.drag_module = null;
        this.drag_module_offset_x = 0;
        this.drag_module_offset_y = 0;
        this.drag_module_prev_x = 0;
        this.drag_module_prev_y = 0;
        this.start = null;
        this.end = null;
        this._original_module_arr = [];
        this._module_arr = [];
        this._ctrl_module_arr = [];
        this._input_module = null;
        this._output_module = null;
        this._samplerate_module = null;
        this._module_seqence = [];
        this.tol = 10;
        this.canvas = canvas;
        this.rendering_context = canvas.getContext("2d");
        this.canvas_height = canvas.height;
        this.canvae_width = canvas.width;
    }
    start_cable_drag(start, end) {
        this.start = start;
        this.end = end;
    }
    get_cable_point() {
        if (this.start != null) {
            return this.start.get_point();
        }
        else if (this.end != null) {
            return this.end.get_point();
        }
        return null;
    }
    is_cable_dragging() {
        return (this.start != null || this.end != null);
    }
    start_module_drag(module, offset_x, offset_y) {
        this.drag_module = module;
        this.drag_module_offset_x = offset_x - module.x;
        this.drag_module_offset_y = offset_y - module.y;
        this.drag_module_prev_x = module.x;
        this.drag_module_prev_y = module.y;
    }
    end_module_drag(offset) {
        this.drag_module.move(offset.x - this.drag_module_offset_x, offset.y - this.drag_module_offset_y);
    }
    cancel_module_drag() {
        this.drag_module.move(this.drag_module_prev_x, this.drag_module_prev_y);
    }
    redraw_modules(modules) {
        for (var m of modules) {
            this.rendering_context.drawImage(m.image, m.x, m.y);
        }
    }
    drawBack() {
        this.rendering_context.clearRect(0, 0, this.canvae_width, this.canvas_height);
        this.rendering_context.beginPath();
        this.rendering_context.lineWidth = 2;
        this.rendering_context.strokeStyle = '#000000';
        this.rendering_context.moveTo(0, 0);
        this.rendering_context.lineTo(this.canvae_width - 1, 0);
        this.rendering_context.lineTo(this.canvae_width - 1, this.canvas_height - 1);
        this.rendering_context.lineTo(0, this.canvas_height - 1);
        this.rendering_context.lineTo(0, 0);
        this.rendering_context.moveTo(0, 50);
        this.rendering_context.lineTo(this.canvae_width - 1, 50);
        this.rendering_context.stroke();
    }
    drawLine(x1, y1, x2, y2, color = '#000000') {
        this.rendering_context.beginPath();
        this.rendering_context.lineWidth = 1;
        this.rendering_context.strokeStyle = color;
        this.rendering_context.moveTo(x1, y1);
        this.rendering_context.lineTo(x2, y2);
        this.rendering_context.stroke();
    }
    drawText(align, q_bus_name, x, y, color = '#000000') {
        if (q_bus_name == '')
            return;
        this.rendering_context.beginPath();
        this.rendering_context.lineWidth = 1;
        this.rendering_context.strokeStyle = color;
        this.rendering_context.moveTo(x, y);
        if (align == 'left') {
            this.rendering_context.lineTo(x + 5, y);
        }
        else {
            this.rendering_context.lineTo(x - 5, y);
        }
        this.rendering_context.stroke();
        this.rendering_context.fillStyle = color;
        this.rendering_context.font = this.rendering_context.font.replace(/[0-9]+px /, '12px ');
        this.rendering_context.textAlign = align;
        if (align == 'left') {
            this.rendering_context.fillText(q_bus_name, x + 7, y + 3);
        }
        else {
            this.rendering_context.fillText(q_bus_name, x - 7, y + 3);
        }
    }
    redraw_cables(module_arr) {
        for (var module of module_arr) {
            for (var output of module.output_arr) {
                var p1 = output.get_point();
                for (var next_input of output.next_input_arr) {
                    var p2 = next_input.get_point();
                    this.drawLine(p1.x, p1.y, p2.x, p2.y);
                }
                this.drawText('left', output.quick_bus_name, p1.x, p1.y);
                for (var quick_bus_next_input of output.quick_bus_next_input_arr) {
                    var p2 = quick_bus_next_input.get_point();
                    this.drawText('right', output.quick_bus_name, p2.x, p2.y);
                }
            }
            for (var input of module.input_arr) {
                var p2 = input.get_point();
                this.drawText('right', input.quick_const, p2.x, p2.y);
            }
        }
    }
    redraw() {
        this.drawBack();
        this.redraw_modules(this._module_arr);
        this.redraw_modules(this._original_module_arr);
        this.redraw_cables(this._module_arr);
    }
    squareDistance(x1, y1, x2, y2) {
        return (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
    }
    getConnectedInput(offset) {
        for (var module of this._module_arr) {
            for (var output of module.output_arr) {
                for (var next_input of output.next_input_arr) {
                    var p = next_input.get_point();
                    if (this.squareDistance(p.x, p.y, offset.x, offset.y) < this.tol * this.tol) {
                        return next_input;
                    }
                }
            }
        }
        return null;
    }
    getConnectedInputQuickBus(offset, module_arr, tol) {
        for (var module of module_arr) {
            for (var output of module.output_arr) {
                for (var next_input of output.quick_bus_next_input_arr) {
                    var p = next_input.get_point();
                    if (this.squareDistance(p.x, p.y, offset.x, offset.y) < tol * tol) {
                        return next_input;
                    }
                }
            }
        }
        return null;
    }
    getHitModuleOutput(offset) {
        for (var m of this._module_arr) {
            var k = m.hit_test_with_output(offset, this.tol);
            if (k >= 0) {
                return m.output_arr[k];
            }
        }
        return null;
    }
    getHitModuleInput(offset) {
        for (var m of this._module_arr) {
            var k = m.hit_test_with_input(offset, this.tol);
            if (k >= 0) {
                return m.input_arr[k];
            }
        }
        return null;
    }
    getHitModule(offset) {
        for (var m of this._module_arr) {
            if (m.hit_test_with_main(offset) == true) {
                return m;
            }
        }
        return null;
    }
    getHitModule2222(offset) {
        for (var m of this._original_module_arr) {
            if (m.hit_test_with_main(offset) == true) {
                return m;
            }
        }
        return null;
    }
    getResisterdQuickBus(name) {
        for (var module of this._module_arr) {
            for (var output of module.output_arr) {
                if (name == output.quick_bus_name) {
                    return output;
                }
            }
        }
        return null;
    }
    is_module_inside_view(big) {
        if (this.drag_module == null)
            return false;
        var line_y = 0;
        if (big == false) {
            line_y = 50;
        }
        if (0 <= this.drag_module.x && this.drag_module.x + this.drag_module.w < this.canvae_width
            && line_y <= this.drag_module.y && this.drag_module.y + this.drag_module.h < this.canvas_height) {
            return true;
        }
        else {
            return false;
        }
    }
    calc_module_order() {
        for (var module of this._module_arr) {
            for (var input of module.input_arr) {
                input.stream_updated = false;
            }
        }
        var module_seqence = [];
        for (var m of this._module_arr) {
            if (m.name == 'delay_module') {
                var delay_m = m;
                module_seqence = module_seqence.concat(delay_m.delay_update());
            }
        }
        this._module_seqence = module_seqence.concat(this._input_module.stream_update());
    }
}
export { ConnectionEditor };
