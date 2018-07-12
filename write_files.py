from flask import Flask, render_template, request, jsonify
app = Flask(__name__)
id_session = 0

@app.route('/')
def index():
	return render_template('index.html')

@app.route("/tables-index/")
def existing():
	import json

	tables = []

	with open("api_output/to_media_server.json", "r") as ofile:
		all_tables_data = json.loads(ofile.read())["data_tables"]
		for key in all_tables_data.keys():
			d = {}
			d["hed"] = all_tables_data[key]["hed"]
			d["chatter"] = all_tables_data[key]["chatter"]
			d["id"] = key
			tables.append(d)
	ofile.close()


	return render_template("tables-index.html", tables=tables)

@app.route("/<table_id>/")
def existing_table(table_id):
	import json

	this_table_data = {} 
	with open("api_output/to_media_server.json", "r") as ofile:
		this_table_data = json.loads(ofile.read())["data_tables"][table_id]
	ofile.close()

	# return "<pre><code>" + json.dumps(this_table_data) + "</code></pre>"

	return render_template("index.html", existing = this_table_data)

 
@app.route('/write/', methods=['POST'])
def write():
	import datetime
	import json

	wrapper_str = str(request.form["wrapper"])
	session_id = str(request.form["id"])

	current = str(datetime.datetime.now())


	new_filename = "table-test-"+ str(session_id) +".html"

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

	existing_json_data = {}


	with open("api_output/to_media_server.json", "r") as ofile:
		existing_json_data = json.loads(ofile.read())
	ofile.close()

	data_to_incl = {}
	data_to_incl["id"] = str(session_id)
	data_to_incl["html"] = request.form["tableHTML"]
	data_to_incl["hed"] = request.form["hed"]
	data_to_incl["chatter"] = request.form["chatter"]
	data_to_incl["input"] = request.form["input"]
	data_to_incl["hasRowHeaders"] = request.form["hasRowHeaders"]
	data_to_incl["sortable"] = request.form["sortable"]
	data_to_incl["hasFooter"] = request.form["hasFooter"]
	data_to_incl["needIndent"] = request.form["needIndent"]


	existing_json_data["data_tables"][str(session_id)] = data_to_incl


	with open("api_output/to_media_server.json", "w") as ofile:
		ofile.write(json.dumps(existing_json_data))
	ofile.close()


	return new_filename

 
if __name__ == '__main__':
	app.run(debug=True)