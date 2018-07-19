var session_id = ""

// set page id if new page
if (existingTrue == false) {
    var session_id = (new Date().getTime() / 1000).toString().replace(".", "")
} else {
    var existingData = {}

    var existingPs = $(".existing-keys p")
    var currentKey = ""
    $(existingPs).each(function(ind, el) {
        if (ind % 2 == 0) {
            currentKey = $(el).text()
        } else {
            existingData[currentKey] = $(el).text()
        }
    })

    if (existingTrue) {
        session_id = existingData["id"]
    }
}


console.log(session_id)
console.log(existingData)


function doConvert(wrapper, existingStart) {



    function writeFile(wrapper, id, hed, chatter, input, hasRowHeaders, sortable, needIndent) {
        $.ajax({
            url: '/write/',
            data: {
                'tableHTML': $("#htmlText").val(),
                "wrapper": wrapper,
                "id": id,
                "hed": hed,
                "chatter": chatter,
                "input": input,
                "hasRowHeaders": hasRowHeaders,
                "sortable": sortable,
                "needIndent": needIndent
            },
            method: 'POST',
            success: function(data) {
                    $("#standalone-url").text("URLPREFIX/" + data)
                    $("#embed-code").text("<div data-pym-src='" + data + "'>&nbsp;</div>")

            }
        });
    }

    function runWriteFile() {
        writeFile(wrapper, session_id, captionText, chatterText, input, hasRowHeaders, sortable, needIndent)
    }


    var input = $('#csvText').val();
    var hasRowHeaders = $('#optFirstRowHeaders').prop('checked');
    var hasColHeaders = $('#optFirstColHeaders').prop('checked');
    var sortable = $('#optSortable').prop('checked');
    var hasCaption = $('#optCaption').prop('checked');
    var hasChatter = $('#optChatter').prop('checked');
    var needIndent = $('#optIndent').prop('checked');
    var captionText = $('#textCaption').val();
    var chatterText = $('#textChatter').val();
    var tablePreview = $("#table-preview");

    var output = ""

    function makeHTMLOutput() {
        // use the jquery-csv plugin to turn the csv into an array
        var csvArray = $.csv.toArrays(input);


        // start creating the table
        output = "<link rel='stylesheet' href='../static/tablesort.css'>\
    <table id='preview-table' class='pure-table pure-table-striped table-responsive'>\n";

        // if the user wants a caption, add that!
        if (hasCaption) {
            output += "<caption class='hed-capt'>" + captionText + "</caption>\n";
        }

        // if the user wants a chatter, add that!
        if (hasChatter) {
            output += "<caption class='chatter-capt'>" + chatterText + "</caption>\n";
        }

        // let's get the header if needed.
        if (hasRowHeaders) {
            var head = "";
            var firstRow = csvArray[0];

            head += "  <thead>\n    <tr>\n";

            $.each(firstRow, function(i, val) {
                head += "      <th scope=\"col\">" + readFormatting(val) + "</th>\n";
            });

            head += "    </tr>\n  </thead>\n";

            output += head;

            // remove the first row from the array
            csvArray.splice(0, 1);
        }


        function readFormatting(val) {
            val = val.replace(/\*(.*)\*/, "<strong>$1</strong>")
            val = val.replace(/_(.*)_/, "<em>$1</em>")
            val = val.replace(/^   /, "&nbsp;&nbsp;&nbsp;")
            return val
        }

        // now let's get to the body!
        var body = "  <tbody>\n";
        $.each(csvArray, function(i, val) {


            // initialize the row output
            var row = "    <tr row-number='" + i + "'>\n";

            $.each(val, function(i, val) {
                val = readFormatting(val)
                if (i === 0 && hasColHeaders) {
                    row += "      <th scope=\"row\">" + val + "</th>\n";
                } else {

                    var dataType = "str"


                    if (isNaN(parseInt(val[0])) == false || (Date.parse(val))) {
                        dataType = "num"
                    }


                    try {
                        row += "      <td class='type-" + dataType + "' data-label='" + firstRow[i] + "'>" + val + "</td>\n";
                    } catch (error) {
                        row += "      <td class='type-" + dataType + "' data-label=''>" + val + "</td>\n";
                    }
                }
            });
            row += "    </tr>\n";


            body += row;
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

    }

    if (existingTrue == false) {
	    makeHTMLOutput()
	}

	else {
		output = existingData["html"]
	}






    // make preview code that has indent options

    var arrowImgs = "<span class='arrow-left arrow-span'><img class='arrow-img' src='../static/assets/left-arrow-01.png'></span><span class='arrow-right arrow-span'><img class='arrow-img' src='../static/assets/right-arrow-01.png'></span>"


    function makePreview() {
	    var outputPreview = output

	    if (needIndent == true) {
	        var outputPreview = output.toString().replace(/(<tr.*>)/g, "$1<td>" + arrowImgs + "</td>")
	    }

		tablePreview.html(outputPreview);
    }

 	if (existingStart !== true) {
	         makePreview() // let's give the user a preview!
    }

	    // output!
    if (existingTrue == false) {
        $('#htmlText').val(output); // throw the html into a textarea
    }






    // make preview indenting interactive

    $("span.arrow-right").on("click", function() {
        // make the preview change
        var thisRow = $(this).closest("tr");
        var thisRowHtml = $(this).closest("tr").html();
        var thisRowNumber = $(thisRow).attr("row-number");
        var existingText = $($(thisRow).children("td")[1]).html();
        $($(thisRow).children("td")[1]).html("&nbsp;&nbsp;&nbsp;" + existingText);


        // make the htmlbox change

        var reSearch = "(<tr row-number='" + thisRowNumber + "'.*\n.*'>)"
        var newRe = new RegExp(reSearch, "g")

        output = $("#htmlText").val().replace(newRe, "$1&nbsp;&nbsp;&nbsp;");
        $('#htmlText').val(output);



    })

    $("span.arrow-left").on("click", function() {
        // make the preview change
        var thisRow = $(this).closest("tr");
        var thisRowHtml = $(this).closest("tr").html();
        var thisRowNumber = $(thisRow).attr("row-number");
        var existingText = $($(thisRow).children("td")[1]).html();
        $($(thisRow).children("td")[1]).html(existingText.replace("&nbsp;&nbsp;&nbsp;", ""));


        // make the htmlbox change

        var reSearch = "(<tr row-number='" + thisRowNumber + "'.*\n.*'>)&nbsp;&nbsp;&nbsp;"
        var newRe = new RegExp(reSearch, "g")

        output = $("#htmlText").val().replace(newRe, "$1");
        $('#htmlText').val(output);



    })








    // end preview interactivity

    tablePreview.find("table").addClass('pure-table pure-table-striped table-responsive'); // adding twitter bootstrap style to make it purdy.
    tablePreview.find("table").attr("id", 'preview-table');
    new Tablesort(document.getElementById('preview-table'));
    $('.output').removeClass('hidden'); // show it!

    // publish button


	$(".pub-table-btn").on("click", function() {
		$(".code-preview-block").removeClass("hidden")
		runWriteFile()
	})


}

// let's work on some interactive features

// only see the caption text field when it's necessary.
$('#optCaption').change(function() {
    $('.caption').toggleClass('hidden');
});


// only see the chatter text field when it's necessary.
$('#optChatter').change(function() {
    console.log("change chatter")
    $('.chatter').toggleClass('hidden');
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

$('.button-caption-help').click(function(e) {
    e.preventDefault();
    $('.captionDescription').toggleClass('hidden');
});


$('.button-chatter-help').click(function(e) {
    e.preventDefault();
    $('.chatterDescription').toggleClass('hidden');
});

$('.preview-csv-contents').click(function(e) {
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
    if ($.inArray(file.type, mimeTypes) > -1) {

        var reader = new FileReader();

        reader.onload = function(e) {
            output.val(reader.result);
        };

        reader.readAsText(file);
        showSuccess();
        $('.step2').removeClass('hidden');
        $('.csv-file-contents').removeClass('hidden');
    } else {

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
    if (existingTrue == false) {
        $('.csv-file-contents').addClass('hidden');
    }

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


        displayFileContents(file);

        return false;
    };

    fileInput.addEventListener('change', function(e) {
        hideErrors();

        var file = fileInput.files[0];


        displayFileContents(file);
        return false;
    });
}


$("#optFirstRowHeaders").change(function() {
    if (this.checked != true) {
        $('#optSortable').prop('checked', false);
        $("#optSortable").attr("disabled", true);
    } else {
        $("#optSortable").attr("disabled", false);
    }
})

