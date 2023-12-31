const imgs = document.querySelectorAll('.content img');
const item_titles = document.querySelectorAll('.content h3');
const colorThief = new ColorThief();
// const canvas = document.createElement('canvas');
// const ctx = canvas.getContext('2d');

window.onload = function() {
    imgs.forEach((img, i) => {
        // dominantColors
        let dc = colorThief.getPalette(img, 5);
        dc.sort(
            (a, b) => b[0] + b[1] + b[2] - (a[0] + a[1] + a[2])
        );
        dc = removeUnwantedColors(dc);
        console.log(dc);
        dc = getMostColorful(dc);
        console.log(dc);
        item_titles[i].style.color = `rgb(${dc[0]}, ${dc[1]}, ${dc[2]})`;

        img.addEventListener("mouseover", ()=>{
            img.style.boxShadow = `0px 0px 40px -5px rgb(${dc[0]}, ${dc[1]}, ${dc[2]})`;
        });
        img.addEventListener("mouseleave", ()=>{
            img.style= '';
        });
    });
}

function removeUnwantedColors(colors) {
    // Remove grayish colors
    const filteredColors = colors.filter(color => {
      const [r, g, b] = color;
      const threshold = 20; // Adjust this threshold as needed
      // Check if the color is not close to gray
      return Math.abs(r - g) > threshold || Math.abs(r - b) > threshold || Math.abs(g - b) > threshold;
    });

    // Remove dark colors
    const darkThreshold = 30; // Adjust this threshold as needed
    const filteredDarkColors = filteredColors.filter(color => {
      const [r, g, b] = color;
      // Check if the color is not too dark
      return r > darkThreshold || g > darkThreshold || b > darkThreshold;
    });

    // Remove bright colors
    const brightThreshold = 220; // Adjust this threshold as needed
    const sumBrightThreshold = 475; // Adjust this threshold as needed
    const filteredBrightColors = filteredDarkColors.filter(color => {
      const [r, g, b] = color;
      // Check if the color is not too bright
      return r + g + b < sumBrightThreshold && (r < brightThreshold || g < brightThreshold || b < brightThreshold);
    });

    const filteredBExceptions = filteredBrightColors.filter(color => {
        const [r, g, b] = color;
        // Check if the color is not too bright
        return !(r==103 && g==168 && b==170) && !(r==220 && g==105 && b==64);
      });

    return filteredBExceptions;
}

function getMostColorful(colors) {
    let totalColorDifference = [];
    for (let i = 0; i < colors.length; i++) {
        totalColorDifference.push(Math.abs(colors[i][0] - colors[i][1]) + Math.abs(colors[i][0] - colors[i][2]) + Math.abs(colors[i][1] - colors[i][2]));
    }

    return colors[totalColorDifference.indexOf(Math.max(...totalColorDifference))];
}