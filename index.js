const puppeteer = require("puppeteer")
const fs = require("fs")

const getTopCryptos = async () => {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      args: [
        "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36",
      ],
    })

    const page = await browser.newPage()

    // Configure the navigation timeout
    // page.setDefaultNavigationTimeout(0)

    await page.goto("https://www.advfn.com/cryptocurrency", {
      waitUntil: "networkidle2",
    })

    await page.waitForSelector(
      "#cryptocurrency_table_wrapper > #cryptocurrency_table > tbody"
    )

    const rows = await page.evaluate(() => {
      const tableRows = document.querySelector(
        "#cryptocurrency_table_wrapper > #cryptocurrency_table > tbody"
      ).rows

      const rowsArray = []

      for (let i = 0; i < tableRows.length; i++) {
        const tableRow = tableRows[i]

        const cells = tableRow.cells

        const rowObject = {
          serialNumber: cells[0].innerHTML,
          cryptoLogo: cells[2].querySelector("a").href,
          cryptoName: cells[3].querySelector("a").text,
          marketCap: cells[4].innerHTML,
          priceInDollars: cells[5].innerHTML,
          change: cells[6].innerHTML.replace("<br>", ""),
          volumeInDollars: cells[7].innerHTML,
          algorithm: cells[8].innerHTML.replace("<br>", ""),
          chart: cells[9].querySelector("a").href,
        }

        rowsArray.push(rowObject)
      }

      return rowsArray
    })

    await page.screenshot({ path: "fullscreen.png", fullPage: true })

    await browser.close()

    const fileStream = fs.createWriteStream("./result.json")

    fileStream.write(JSON.stringify(rows))

    fileStream.end()

    console.log("Scraping done!")
  } catch (error) {
    console.log("Error => ", error)
  }
}

module.exports = getTopCryptos()
