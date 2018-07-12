import json
from css_html_js_minify import process_single_html_file, process_single_js_file, process_single_css_file


def new_minified_htm(orig_file):
	page_full = ""
	with open("templates/" + orig_file + ".html", "r") as ofile:
		page_full = ofile.read()
	ofile.close()

	with open("templates/" + orig_file + "-minified.html", "w") as ofile:
		ofile.write(page_full)
	ofile.close()

	process_single_html_file("templates/" + orig_file + "-minified.html", overwrite=True)

for fname in ["clean_table", "cq-wrapper"]:
	new_minified_htm(fname)

api_output_json = {}
clean_table_minified = ""
cq_wrapper_minified = ""

with open("templates/clean_table-minified.html", "r") as ofile:
	clean_table_minified = ofile.read()
ofile.close()

with open("templates/cq-wrapper-minified.html", "r") as ofile:
	cq_wrapper_minified = ofile.read()
ofile.close()

with open("api_output/to_media_server.json", "r") as ofile:
	api_output_json = json.loads(ofile.read())
	api_output_json["embed_template"] = clean_table_minified
	api_output_json["cq_page_template"] = cq_wrapper_minified
ofile.close()

with open("api_output/to_media_server.json", "w") as ofile:
	ofile.write(json.dumps(api_output_json))
ofile.close()


