from flask import Flask, render_template, request, jsonify
app = Flask(__name__)


@app.route('/')
def index():
	return render_template('index.html')
 
@app.route('/write/', methods=['POST'])
def write():
	import datetime
	wrapper_str = str(request.form["wrapper"])

	current = str(datetime.datetime.now())


	new_filename = "table-test.html"

	html = ""

	if wrapper_str == "true":
		with open("templates/cq-wrapper.html") as ofile:
			html = ofile.read().replace("{{TABLE CONTENT}}", request.form["tableHTML"])
		ofile.close()
	else:
		with open("templates/clean_table.html") as ofile:
			html = ofile.read().replace("{{TABLE CONTENT}}", request.form["tableHTML"])
		ofile.close()


	with open("tables/" + new_filename, "w") as ofile:
		ofile.write(html);
	ofile.close()
	return new_filename
 
if __name__ == '__main__':
	app.run(debug=True)