let fs = require('fs');
let path = require('path');
let exec = require('child_process').exec;

function readFile() {
	fs.readFile(path.join(__dirname, './selection.json'), (error, data) => {
		if (error) throw error;

		let icomoonObj = JSON.parse(data.toString());
		let newJson = {};

		for (let item of icomoonObj.icons) {
			newJson[item.properties.name] = item.properties.code;
		}

		fs.writeFile("Icomoon.json", JSON.stringify(newJson), {
			flag: 'w'
		}, (error) => {
			if (error) throw error;
			console.log('success to get Icommon.json')
			moveIcomoon();
		})
	})
}

function moveIcomoon() {
	let mvIcommonJson = 'cp ./Icomoon.json /Users/liyi/Desktop/company/mes_pda/node_modules/react-native-vector-icons/glyphmaps'; // 拷贝Icomoon.json到依赖包路径
	let mvIcommonFont = 'cp ./fonts/icomoon.ttf /Users/liyi/Desktop/company/mes_pda/node_modules/react-native-vector-icons/Fonts/Icomoon.ttf'; // 拷贝Icomoon.ttf到依赖包路径
	let mvIcommonFontToAndroidDir = 'cp ./fonts/icomoon.ttf /Users/liyi/Desktop/company/mes_pda/android/app/src/main/assets/fonts/Icomoon.ttf'; // 拷贝Icomoon.ttf到项目路径
	let cmds = [mvIcommonJson, mvIcommonFont, mvIcommonFontToAndroidDir];

	for (let item of cmds) {
		exec(item, (error, stdout, stderr) => {
			if (error) throw error;
			console.log('success to ' + item);
		})
	}

}

readFile();