all:
	cat src/index.html | grep -v "Three\\.js\|underscore-min\\.js" > index.html
	sqwish src/main.css -o main.css
	cat src/Three.js src/underscore-min.js src/main.js | uglifyjs -o main.js

clean:
	rm index.html main.css main.js

install:
	npm install