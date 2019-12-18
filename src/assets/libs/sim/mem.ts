export function memorySizeOf(obj) {
    let bytes = 0;
    function sizeOf(_obj) {
        if (_obj !== null && _obj !== undefined) {
            switch (typeof _obj) {
            case 'number':
                bytes += 8;
                break;
            case 'string':
                bytes += _obj.length * 2;
                break;
            case 'boolean':
                bytes += 4;
                break;
            case 'object':
                const objClass = Object.prototype.toString.call(_obj).slice(8, -1);
                if (objClass === 'Object' || objClass === 'Array') {
                    for (const key in _obj) {
                        if (!_obj.hasOwnProperty(key)) {continue; }
                        sizeOf(_obj[key]);
                    }
                } else {bytes += _obj.toString().length * 2; }
                break;
            }
        }
        return bytes;
    }
    function formatByteSize(_bytes) {
        if (_bytes < 1024) {return _bytes + ' bytes'; }
        else if (_bytes < 1048576) {return (_bytes / 1024).toFixed(3) + ' KiB'; }
        else if (_bytes < 1073741824) {return (_bytes / 1048576).toFixed(3) + ' MiB'; }
        else {return (_bytes / 1073741824).toFixed(3) + ' GiB'; }
    }
    return formatByteSize(sizeOf(obj));
}
