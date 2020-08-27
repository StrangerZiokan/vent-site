const express = require('express');
const cors = require('cors');
const app = express();
//const bodyParser = require('body-parser');

//app.use(bodyParser.json());
const mongo = require('mongodb');
const monk = require('monk');
const db = monk(`mongodb+srv://Shikhar:Modi@123@cluster0.d21no.mongodb.net/mews?retryWrites=true&w=majority`);
db.then(() =>{
  console.log("connection success");
}).catch((e)=>{
  console.error("Error !",e);
});

const mews =db.get('mews');

const Filter = require('bad-words');
const filter = new Filter();

const rateLimit = require('express-rate-limit');

app.use(cors());
app.use(express.json());



app.get('/', (req, res) => {
    res.json({
        message:'God is one reallly'
    });
});

app.get('/mews', (req, res) => {
    mews
        .find()
        .then(mews => {
            res.json(mews);
        });
});

function isValid(mew) {
    return (mew.name && mew.name.toString().trim() != '') &&
    (mew.content && mew.content.toString().trim() != '');
}

app.use(rateLimit({
    windowMs: 10*1000,
    max:1
}));


app.post('/mews', (req, res) => {
    //console.log(req.body);
    if(isValid(req.body)) {
        const mew = {
            name: filter.clean(req.body.name.toString()),
            content: filter.clean(req.body.content.toString()),
            created: new Date()
        };

        console.log(mew);
        mews
            .insert(mew)
            .then(created => {
                res.json(created)
            });
    }else {
        res.status(422);
        res.json({
            message:'requires name and content'
        });
    }
});

app.listen(5000, () => {
    console.log('Listening on port 5000');
});