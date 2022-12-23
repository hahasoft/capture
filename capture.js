const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const port = process.env.PORT || 8080;
const isMode = process.env.IS_MODE || 'dev';


function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
};

async function capture(url,user,pwd){
	console.log('url='+ url +' ,user='+user+' ,pwd='+pwd +',mode='+isMode)
	let browser = null;
	try {		
		if ( isMode === 'dev'){
			browser = await  puppeteer.launch({
											args: [
											'--no-sandbox',
											'--disable-setuid-sandbox',
											'--disable-dev-shm-usage']
											});
		
		}else{
			browser = await puppeteer.launch({
										headless: true,
										executablePath: '/usr/bin/chromium-browser',
										args: [
											'--no-sandbox',
											'--disable-gpu',
										]
								});
		}
		
		const page = await browser.newPage();	
		await page.setViewport({ width: 1920, height: 1080});
		if (user) {
			await page.setExtraHTTPHeaders({
				'Authorization': `Basic ${Buffer.from(`${user}:${pwd}`).toString('base64')}`,
			})
		}
    
		await page.goto(url, {waitUntil: 'networkidle2'});
	
		//await timeout(10000)
		await page.waitForTimeout (10000);	
        const screenshot = await page.screenshot({fullPage: true });
		
		//await fs.writeFile("/tmp/current.jpg", screenshot,  "binary",function(err) { });
		
		return screenshot;
        //res.end(screenshot, 'binary');
    } catch (error) {
		console.log('err='+error.message);
		return error.message;
      
    } finally {
      if (browser) {
        browser.close();
      }
    }
	
}

app.post('/cap', async (req, res) => { 
	console.log(req.body)

  const baseUrl = req.body.url;
  const user = req.body.user || null ;
  const pwd = req.body.pwd || null ;
  
  try {
	const screenshot = await capture(baseUrl,user,pwd);	
	res.end(screenshot, 'binary');
	
  } catch (error) {
      if (!res.headersSent) {
        res.status(400).send(error.message);
      }
  } 
  
});

app.listen(port, () => console.log('Listening on PORT: '+ port));

