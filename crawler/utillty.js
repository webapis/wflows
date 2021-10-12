const makeDir = require('make-dir')
const fs = require('fs')
const path = require('path')
const artifact = require('@actions/artifact');
async function saveData({ data, output, filename }) {
    debugger;
    const outputPath = `${process.cwd()}/data.json`

    let dataObject = [];
    makeDir.sync(path.dirname(outputPath))
    if (fs.existsSync(outputPath)) {

        const dataFromFile = fs.readFileSync(outputPath, { encoding: 'utf-8' });
        dataObject = JSON.parse(dataFromFile);
        dataObject.push(data);
    } else {
        dataObject.push(data);
    }
    fs.writeFileSync(outputPath, JSON.stringify(dataObject));
  process.on('exit', async()=>{
      
      console.log('upload artifacts')
      if(process.env.LOCAL!=='TRUE'){
        const artifactClient = artifact.create()
        const artifactName = 'data-artifact';
        const files = [
            outputPath
        ]
        const rootDirectory = process.cwd()
        const options = {
            continueOnError: false
        }
        
        const uploadResult = await artifactClient.uploadArtifact(artifactName, files, rootDirectory, options)
        console.log('uploadResult',uploadResult)
      }
  })
}


async function autoScroll(page) {
    await page.evaluate(async () => {

        let last = 0
        await new Promise((resolve, reject) => {

            var scrollingElement = (document.scrollingElement || document.body);
            const timer = setInterval(async () => {
                // window.focus()
                scrollingElement.scrollTop = scrollingElement.scrollHeight;

                if (scrollingElement.scrollHeight === last) {
                    clearInterval(timer)
                    resolve()
                } else {
                    last = scrollingElement.scrollHeight
                }
            }, 5000);



        });
    });
}

module.exports = { saveData, autoScroll }