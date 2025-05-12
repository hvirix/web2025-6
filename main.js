const { program } = require ('commander');
const fs = require ('fs');
const http = require ('http');
const path = require ('path');
const express = require("express");
const multer = require("multer");

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

app.use('/notes/:noteName', express.text());
app.use('/write', multer().none());
app.use('/', express.static('public'));

app.get('/notes/:noteName', (req, res) => {
    const notePath = path.join(options.cache, `${req.params.noteName}.txt`);

    if (!fs.existsSync(notePath)) {
        return res.status(404).send();
    }

    const noteContent = fs.readFileSync(notePath);
    res.send(noteContent);
});

app.put('/notes/:noteName', (req, res) => {
    const notePath = path.join(options.cache, `${req.params.noteName}.txt`);

    if (!fs.existsSync(notePath)) {
        return res.status(404).send();
    }

    fs.writeFileSync(notePath, req.body);
    res.send();
});

app.delete('/notes/:noteName', (req, res) => {
    const notePath = path.join(options.cache, `${req.params.noteName}.txt`);

    if (!fs.existsSync(notePath)) {
        return res.status(404).send();
    }
    fs.unlinkSync(notePath);
    res.send();
});

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

app.post('/write',(req, res) => {
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









