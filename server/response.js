'use strict';
/**
 * This file defines Response construtor
 */
class Response {
    constructor(code,reason,content) {
        this.code = code;
        this.reason = reason;
        this.content = content;
    }
}

/**
 * Response success format.
 *
 * @param code
 * @param reason
 * @param content
 * @returns {Response}
 */
module.exports = function response(code,reason,content) {
    code = code || 200;
    reason=reason || "";
    content = content || {};
    return new Response(code,reason,content);
};
