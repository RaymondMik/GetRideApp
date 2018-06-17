const {app} = require('../app.js');

// Set PORT for usage in both development and production with Heroku
const port = process.env.PORT;

app.listen(port, () => {
    console.log(`server running at port ${port}`)
});