// Google Analytics tracking
 var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-9487590-12']);
  _gaq.push(['_trackPageview']);

  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' === document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();


function doConvert(wrapper) {




	function writeFile(wrapper){
		$.ajax({
	      url: '/write/',
	      data: {'tableHTML': $("#htmlText").val(), "wrapper": wrapper},
	      method: 'POST',
	      success: function(data) {
	      	if (wrapper == true) {
	      		$("#standalone-url").text("URLPREFIX/"+ data)
				$("#standalone-url").css("display", "block")
				$(".embed").css("display", "none")
				$(".standalone").css("display", "block")
	      	}
	      	else {
	      		$("#embed-code").text("<div data-pym-src='"+ data +"'>&nbsp;</div>")
				$("#embed-code").css("display", "block")
				$(".embed").css("display", "block")
				$(".standalone").css("display", "none")
	      	}
	        
	      }
	    });

	    

	}


	var input = $('#csvText').val();
	var hasRowHeaders = $('#optFirstRowHeaders').prop('checked');
	var sortable = $('#optSortable').prop('checked');
	var hasColHeaders = $('#optFirstColHeaders').prop('checked');
	var hasFooter = $('#optLastRowFooter').prop('checked');
	var hasCaption = $('#optCaption').prop('checked');
	var captionText = $('#textCaption').val();
	var tablePreview = $("#table-preview");



	// trim some of that whitespace!!
	// borrowed from http://stackoverflow.com/questions/3721999/trim-leading-trailing-whitespace-from-textarea-using-jquery
	input = $.trim(input).replace(/\s*[\r\n]+\s*/g, '\n')
                               .replace(/(<[^\/][^>]*>)\s*/g, '$1')
                               .replace(/\s*(<\/[^>]+>)/g, '$1');


	// use the jquery-csv plugin to turn the csv into an array
	var csvArray = $.csv.toArrays(input);

	
	// start creating the table
	var output = "<link rel='stylesheet' href='../static/tablesort.css'>\
    <table id='preview-table' class='pure-table pure-table-striped table-responsive'>\n";
	
	// if the user wants a caption, add that!
	if (hasCaption) {
		output += "<caption>" + captionText + "</caption>\n";
	}

	// let's get the header if needed.
	if (hasRowHeaders) {
		var head = "";
		var firstRow = csvArray[0];

		head += "  <thead>\n    <tr>\n";

			$.each(firstRow,function(i,val){
				head += "      <th scope=\"col\">"+val+"</th>\n";
			});

		head += "    </tr>\n  </thead>\n";

		output += head;

		// remove the first row from the array
		csvArray.splice(0,1);
	}

	// let's get the footer if needed.
	// since the tfooter is placed before the body, we'll do the parsing acoordingly,
	// then remove the last row from the array so that it doesn't end up in the body again.
	if (hasFooter) {
		var footer = "";
		
		var lastElement = csvArray.length-1;
		var lastRow = csvArray[lastElement];
		
		footer += "  <tfoot>\n    <tr>\n";

			$.each(lastRow,function(i,val){
				footer += "      <th>"+val+"</th>\n";
			});

		footer += "    </tr>\n  </tfoot>\n";

		output += footer;

		// remove the last row from the array
		csvArray.splice(lastElement,1);
	}

	function readFormatting(val) {
		val = val.replace(/\*(.*)\*/, "<strong>$1</strong>")
		val = val.replace(/_(.*)_/, "<em>$1</em>")
		val = val.replace(/^   /, "&nbsp;&nbsp;&nbsp;&nbsp;")
		return val
	}

	// now let's get to the body!
	var body = "  <tbody>\n";
	$.each(csvArray, function(i, val){

		
		// initialize the row output
		var row = "    <tr row-number='" + i + "'>\n";
		
		$.each(val,function(i,val){
			val = readFormatting(val)
			if (i===0 && hasColHeaders) {
				row += "      <th scope=\"row\">"+val+"</th>\n";
			}
			else {

				var dataType = "str"

				if (isNaN(val) == false) {
					dataType = "num"
				}


				try {
					row += "      <td class='type-" + dataType + "' data-label='"+ firstRow[i] +"'>"+val+"</td>\n";
				}
				catch(error) {
					row += "      <td class='type-" + dataType + "' data-label=''>"+val+"</td>\n";
				}
			}
		});
		row += "    </tr>\n";

		
		body+=row;
	});

	body += "  </tbody>\n";

	output += body;
	
	output += "</table>";

	if (sortable == true) {
			output += "<script src='../static/tablesort.min.js'></script>\
		    <script src='../static/sorts/tablesort.number.min.js'></script>\
		    <script src='../static/sorts/tablesort.date.min.js'></script>\
		    <script>\
		    new Tablesort(document.getElementById('preview-table'));\
		    </script>";
	}



// make preview code that has indent options

	var arrowImgs = "<span class='arrow-left arrow-span'><img class='arrow-img' src='../static/assets/left-arrow-01.png'></span><span class='arrow-right arrow-span'><img class='arrow-img' src='../static/assets/right-arrow-01.png'></span>"


	var outputPreview = output.toString().replace(/(<tr.*>)/g , "$1<td>" + arrowImgs + "</td>")

	





	// output!
	$('#htmlText').val(output); // throw the html into a textarea

	

	tablePreview.html(outputPreview); // let's give the user a preview!



	// make preview indenting interactive

	$("span.arrow-right").on("click", function(){
		// make the preview change
		var thisRow = $(this).closest("tr");
		var thisRowHtml = $(this).closest("tr").html();
		var thisRowNumber = $(thisRow).attr("row-number");
		var existingText = $($(thisRow).children("td")[1]).html();
		$($(thisRow).children("td")[1]).html("&nbsp;&nbsp;&nbsp;" + existingText);


		// make the htmlbox change

		var reSearch = "(<tr row-number='"+ thisRowNumber +"'.*\n.*'>)"
		var newRe = new RegExp(reSearch, "g")

		output = output.replace(newRe, "$1&nbsp;&nbsp;&nbsp;");
		$('#htmlText').val(output);

		writeFile(wrapper);


	})

	$("span.arrow-left").on("click", function(){
		// make the preview change
		var thisRow = $(this).closest("tr");
		var thisRowHtml = $(this).closest("tr").html();
		var thisRowNumber = $(thisRow).attr("row-number");
		var existingText = $($(thisRow).children("td")[1]).html();
		$($(thisRow).children("td")[1]).html(existingText.replace("&nbsp;&nbsp;&nbsp;", ""));


		// make the htmlbox change

		var reSearch = "(<tr row-number='"+ thisRowNumber +"'.*\n.*'>)&nbsp;&nbsp;&nbsp;"
		var newRe = new RegExp(reSearch, "g")

		output = output.replace(newRe, "$1");
		$('#htmlText').val(output);

		writeFile(wrapper);


	})








	// end preview interactivity

	tablePreview.find("table").addClass('pure-table pure-table-striped table-responsive'); // adding twitter bootstrap style to make it purdy.
	tablePreview.find("table").attr("id", 'preview-table');
	new Tablesort(document.getElementById('preview-table'));
	$('.output').removeClass('hidden'); // show it!


	writeFile(wrapper);
	
}

// let's work on some interactive features

// only see the caption text field when it's necessary.
$('#optCaption').change(function() {
	$('.caption').toggleClass('hidden');
});

// display the success message
function showSuccess() {
	$('.alerts .alert-success').removeClass('hidden');
}

// display the error message (specific to MIME types)
function showError() {
	$('.alerts .alert-danger').removeClass('hidden');
}

// hides all errors!
function hideErrors() {
	$('.alerts .alert').addClass('hidden');
}

$('.button-caption-help').click(function(e){
	e.preventDefault();
	$('.captionDescription').toggleClass('hidden');
});

$('.preview-csv-contents').click(function(e){
	e.preventDefault();
	$('.csv-text-container').toggleClass('hidden');
});

$('#btn-upload').click(function(e) {
	e.stopPropagation();
	e.preventDefault();
	$("#fileInput").click();

});

// takes a file added through the HTML5 File API and add contents to the textarea
function displayFileContents(file) {
	var output = $('#csvText');
	output.val('');
	
	var mimeTypes = ["text/comma-separated-values", "text/csv", "application/csv", "application/excel", "application/vnd.ms-excel", "application/vnd.msexcel", "text/anytext"];
	if ($.inArray(file.type,mimeTypes) > -1) {

		var reader = new FileReader();

		reader.onload = function(e) {
			output.val(reader.result);
		};

		reader.readAsText(file);
		showSuccess();
		$('.step2').removeClass('hidden');
		$('.csv-file-contents').removeClass('hidden');
	}
	else {
		
		showError();
	}
	return false;
}




// file drag and drop support!!

if (window.File && window.FileReader) {

	var fileDrop = document.getElementById('filedrop');
	var fileInput = document.getElementById('fileInput');

	$('.file-container').removeClass('hidden');
	$('label.csv-text').html('Your CSV file contents:');
	$('.csv-file-contents').addClass('hidden');
	
	fileDrop.className = 'visible';

	// change visible state when hovering
	fileDrop.ondragover = function() {
		this.className = 'hover';
		return false;
	};
	
	// revert visible state when done
	fileDrop.ondragend = function() {
		this.className = '';
		return false;
	};

	// when file is dropped in the item
	fileDrop.ondrop = function(e) {
		hideErrors();
		this.className = '';
		e.preventDefault();

		var file = e.dataTransfer.files[0];
		
		// let's track which file method people are using for future UI improvements
		_gaq.push(['_trackEvent', 'Upload', 'Method', 'Drag and drop']);
		
		displayFileContents(file);
		
		return false;
	};

	fileInput.addEventListener('change', function(e) {
		hideErrors();

		var file = fileInput.files[0];

		// let's track which file method people are using for future UI improvements
		_gaq.push(['_trackEvent', 'Upload', 'Method', 'File Input']);
		
		displayFileContents(file);
		return false;
	});
}


$("#optFirstRowHeaders").change(function() {
	if (this.checked != true) {
		$('#optSortable').prop('checked', false);
		$("#optSortable").attr("disabled", true);
	}
	else {
		$("#optSortable").attr("disabled", false);
	}
})









