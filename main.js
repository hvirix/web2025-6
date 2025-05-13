const { program } = require ('commander');
const fs = require ('fs');
const http = require ('http');
const path = require ('path');
const express = require("express");
const multer = require("multer");
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

program
    .option('-h, --host <address>')
    .option('-p, --port <number>')
    .option('-с, --cache <path>')

program.parse();
const options = program.opts();

if (!options.cache) {
    console.log('Please, specify a cache directory');
    return;
}

if (!options.port) {
    console.log('Please, specify port');
    return;
}

if (!options.host) {
    console.log('Please, specify host');
    return;
}

const app = express();

const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: 'Notes',
            description: 'Сервіс збереження нотаток',
            servers: [`${options.host}:${options.port}`]
        }
    },
    apis: ['main.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));



/**
 * @swagger
 * /notes/{noteName}:
 *   get:
 *     summary: Отримати вміст нотатки
 *     parameters:
 *       - in: path
 *         name: noteName
 *         required: true
 *     responses:
 *       200:
 *         description: Вміст нотатки
 *       404:
 *         description: Нотатку не знайдено
 */
app.get('/notes/:noteName', (req, res) => {
    const notePath = path.join(options.cache, `${req.params.noteName}.txt`);

    if (!fs.existsSync(notePath)) {
        return res.status(404).send();
    }
    const noteContent = fs.readFileSync(notePath, );
    res.contentType('text/plain');
    res.send(noteContent);
});
/**
 * @swagger
 * /notes/{noteName}:
 *   put:
 *     summary: Оновити існуючу нотатку
 *     parameters:
 *       - in: path
 *         name: noteName
 *         required: true
 *     requestBody:
 *       required: true
 *     responses:
 *       200:
 *         description: Нотатку оновлено
 *       404:
 *         description: Нотатку не знайдено
 */
app.put('/notes/:noteName', express.text(),(req, res) => {
    const notePath = path.join(options.cache, `${req.params.noteName}.txt`);

    if (!fs.existsSync(notePath)) {
        return res.status(404).send();
    }

    fs.writeFileSync(notePath, req.body);
    res.send();
});
/**
 * @swagger
 * /notes/{noteName}:
 *   delete:
 *     summary: Видалити нотатку
 *     parameters:
 *       - in: path
 *         name: noteName
 *         required: true
 *     responses:
 *       200:
 *         description: Нотатку видалено
 *       404:
 *         description: Нотатку не знайдено
 */
app.delete('/notes/:noteName', (req, res) => {
    const notePath = path.join(options.cache, `${req.params.noteName}.txt`);

    if (!fs.existsSync(notePath)) {
        return res.status(404).send();
    }
    fs.unlinkSync(notePath);
    res.send();
});
/**
 * @swagger
 * /notes:
 *   get:
 *     summary: Отримати список всіх нотаток
 *     responses:
 *       200:
 *         description: Список нотаток
 */
app.get('/notes',(req, res) => {
    const notes = fs.readdirSync(options.cache)
        .filter((name) => name.endsWith('.txt'))
        .map((file) => {
            const noteName = file.replace('.txt', '');
            const noteText = fs.readFileSync(path.join(options.cache, file), 'utf8');
            return {name: noteName, text: noteText}
        });
    res.status(200).json(notes);
});


/**
 * @swagger
 * /write:
 *   post:
 *     summary: Створити нову нотатку
 *     requestBody:
 *       required: true
 *     responses:
 *       201:
 *         description: Нотатку створено
 *       400:
 *         description: Нотатка вже існує
 */
app.use('/', express.static('public'));
app.use('/write', multer().none());

app.post('/write', (req, res) => {
    const name = req.body.note_name;
    const note = req.body.note;
    const filePath = path.join(options.cache, `${name}.txt`);
    if(fs.existsSync(filePath)){
        return res.status(400).send();
    }
    fs.writeFileSync(filePath, note);
    res.status(201).send();
});

app.listen(options.port, options.host); {}









