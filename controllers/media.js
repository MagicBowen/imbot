const logger = require('../utils/logger').logger('controller-media');
const uuid = require('node-uuid');
const fs = require('fs');
const ImageUtil = require('../utils/image');

function saveFile(file, path) {
    return new Promise( (resolve, reject) => {
        const reader = fs.createReadStream(file.path);
        const ext = file.name.split('.').pop();
        if (ext != 'mp3' && ext != 'mp4' && ext != 'png' && ext != 'jpg' && ext != 'jpeg') {
            throw reject('not support file type : ' + ext);
        }
        const fileName = `${uuid.v1()}.${ext}`;
        const filePath = `${path}/${fileName}`;
        const upStream = fs.createWriteStream(filePath);
        upStream.on('finish', () => {
            upStream.close( ()=> {
                resolve(fileName);
            });
        });
        reader.pipe(upStream);
    })
}

async function postImage(ctx) {
    try {
        let imageFileName = await saveFile(ctx.request.body.files.image, 'static/image');
        const ext = imageFileName.split('.').pop();
        let compress = ctx.query.compress;
        if (compress && ext !== 'gif') {
            ImageUtil.fitToPhone(imageFileName, 'static/image')
            logger.debug(`upload image ${imageFileName} has been compressed!`);
        }
        ctx.response.body = {url : 'image/' + imageFileName};
        ctx.response.type = "application/json";
        ctx.response.status = 200;
    } catch (err) {
        ctx.response.status = 404;
        ctx.response.type = "application/json";
        ctx.response.body = {error: err.toString()};
        logger.error('upload image failed: ' + err);
        logger.debug(err.stack);
    }
}

async function postAudio(ctx) {
    try {
        const mp3FileName = await saveFile(ctx.request.body.files.audio, 'static/audio');
        ctx.response.type = "application/json";
        ctx.response.status = 200;
        ctx.response.body = {url : '/audio/' + mp3FileName};
    } catch (err) {
        ctx.response.status = 404;
        ctx.response.type = "application/json";
        ctx.response.body = {error: err.toString()};
        logger.error('post audio failed: ' + err);
    }
}

async function postVedio(ctx) {
    try {
        const filename = await saveFile(ctx.request.body.files.vedio, 'static/vedio');
        ctx.response.type = "application/json";
        ctx.response.status = 200;
        ctx.response.body = {url : '/vedio/' + filename};
    } catch (err) {
        ctx.response.status = 404;
        ctx.response.type = "application/json";
        ctx.response.body = {error: err.toString()};
        logger.error('post vedio failed: ' + err);
    }
}

module.exports = {
    'POST /image' : postImage,
    'POST /audio' : postAudio,
    'POST /vedio' : postVedio
}
