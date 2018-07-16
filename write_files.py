from flask import Flask, render_template, request, jsonify
app = Flask(__name__)
id_session = 0

import os 
from flask import send_from_directory     
import copy

@app.route('/')
def index():
	return render_template('index.html')


@app.route('/favicon.ico/') 
def favicon(): 
    return send_from_directory(os.path.join(app.root_path, 'static'), 'favicon.ico', mimetype='image/vnd.microsoft.icon')


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

@app.route("/table-<table_id>/")
def existing_table(table_id):
	print(table_id)
	import json

	this_table_data = {} 
	with open("api_output/to_media_server.json", "r") as ofile:
		this_table_data = json.loads(ofile.read())["data_tables"][table_id]
	ofile.close()

	# return "<pre><code>" + json.dumps(this_table_data) + "</code></pre>"

	return render_template("index.html", existing = this_table_data)

 
@app.route('/write/', methods=['POST', "GET"])
def write():
	import datetime
	import json
	import re

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
	data_to_incl["needIndent"] = request.form["needIndent"]
	data_to_incl["wrapper_str"] = wrapper_str
	data_to_incl["html_preview"] = copy.copy(request.form["tableHTML"])
	if data_to_incl["needIndent"] == "true":
		data_to_incl["html_preview"] = re.sub(r'(<tr.*>)',r"\1<td><span class='arrow-left arrow-span'><img class='arrow-img' src='../static/assets/left-arrow-01.png'></span><span class='arrow-right arrow-span'><img class='arrow-img' src='../static/assets/right-arrow-01.png'></span></td>", data_to_incl["html_preview"])




	existing_json_data["data_tables"][str(session_id)] = data_to_incl


	with open("api_output/to_media_server.json", "w") as ofile:
		ofile.write(json.dumps(existing_json_data))
	ofile.close()


	return new_filename

 
if __name__ == '__main__':
	app.run(debug=True)