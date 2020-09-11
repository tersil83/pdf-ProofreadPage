//pdfjs customization
(function() {
  var currentPageIndex = 0;
   pdfInstance = null;
   totalPagesCount = 0;
   scale = 1;
   urlInit = "https://www.dir-toolbox.com:8443/toolbox/corpusfilebyid.pdf?documentId=";
     idPdfFromQueryString = getParameterByName('idPdf', document.location.href);
     url = urlInit + idPdfFromQueryString;


  const viewport = document.querySelector("#pdfviewport");
  var loadingTask = pdfjsLib.getDocument(url);
  loadingTask.promise.then(function(pdf) {
      console.log('PDF loaded');
      pdfInstance = pdf;
      totalPagesCount = pdf.numPages;
      initPager();
      goToPage();
      initPagerZoom();
      render();
      initSample();
  });

  function onPagerButtonsClick(event) {
    const action = event.target.getAttribute("data-pager");
    const zoom = event.target.getAttribute("data-pager-zoom");
    if (action === "prev") {
      if (currentPageIndex === 0) {
        return;
      }
      currentPageIndex -= 1;
      if (currentPageIndex < 0) {
        currentPageIndex = 0;
      }
      render();
      initSample();
    }
    if (action === "next") {
      if (currentPageIndex === totalPagesCount - 1) {
        return;
      }
      currentPageIndex += 1;
      if (currentPageIndex > totalPagesCount - 1) {
        currentPageIndex = totalPagesCount - 1;
      }
      render();
      initSample();
    }
    if (zoom === "zoom_in") {
      if (scale > 5) {
        return;
      }
      scale += 0.25;
      render();
    }
    if (zoom === "zoom_out"){
      if (scale <= 0.25) {
        return;
      }
      scale -= 0.25;
      render();
    }
  }

  function initPager() {
    const pager = document.querySelector("#pager");
    pager.addEventListener("click", onPagerButtonsClick);
    return () => {
      pager.removeEventListener("click", onPagerButtonsClick);
    };
  }

  function initPagerZoom() {
    const pagerZoom = document.querySelector("#pagerZoom");
    pagerZoom.addEventListener("click", onPagerButtonsClick);
    return () => {
      pagerZoom.removeEventListener("click", onPagerButtonsClick);
    };
  }

  function onGoToPageChange(event) {
    currentPageIndex = Number(event.target.value)-1;
    render();
  }

  function goToPage() {
    const input = document.querySelector("#pageNumber");
    input.setAttribute("max", totalPagesCount);
    input.addEventListener("change", onGoToPageChange);
    return () => {
      input.removeEventListener("change", onGoToPageChange);
    };
  }

  function render() {
    const startPageIndex = currentPageIndex;
    const endPageIndex =
      startPageIndex + 1 < totalPagesCount
        ? startPageIndex
        : totalPagesCount - 1;

    const renderPagesPromises = [];
    for (let i = startPageIndex; i <= endPageIndex; i++) {
      renderPagesPromises.push(pdfInstance.getPage(i + 1));
    }

    Promise.all(renderPagesPromises).then(pages => {
      pages.forEach(renderPage);
    });
  }

  function getPageNumber(numPg){
    return numPg + 1
  }

  function renderPage(page) {
    let pdfViewport = page.getViewport({scale:scale});
    var canvas = document.getElementById('pdf-canvas');
    var context = canvas.getContext("2d");
    canvas.height = pdfViewport.height;
    canvas.width = pdfViewport.width;

    page.render({
      canvasContext: context,
      viewport: pdfViewport
    });

    // Update page counters
    document.getElementById('pageNumber').value = getPageNumber(currentPageIndex);
    document.getElementById('page_count').textContent = totalPagesCount;
  };
  
})();

function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
  results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
  
//ckeditor customization

if ( CKEDITOR.env.ie && CKEDITOR.env.version < 9 )
CKEDITOR.tools.enableHtml5Elements( document );

// The trick to keep the editor in the sample quite small
// unless user specified own height.
//CKEDITOR.config.width = 'auto';
//CKEDITOR.config.height = '600px';

var initSample = ( function() {
var wysiwygareaAvailable = isWysiwygareaAvailable(),
  isBBCodeBuiltIn = !!CKEDITOR.plugins.get( 'bbcode' );

return function() {
  var editorElement = CKEDITOR.document.getById( 'editor' );

  // :(((
  if ( isBBCodeBuiltIn ) {
    editorElement.setHtml(
      'Nessun testo da visualizzare'
    );
  }

  // Depending on the wysiwygarea plugin availability initialize classic or inline editor.
  if ( wysiwygareaAvailable ) {

    if (CKEDITOR.instances.editor) {
      CKEDITOR.instances.editor.destroy();
    }

    // Create a request variable and assign a new XMLHttpRequest object to it.
    var request = new XMLHttpRequest()

    editor = setTimeout(function(){ 
      CKEDITOR.replace( 'editor', {
      extraPlugins: 'autogrow',
      autoGrow_minHeight: 200,
      autoGrow_maxHeight: 600,
      autoGrow_bottomSpace: 50,
      removePlugins: 'resize'
      } ); },400);

      textcontent =""
      apiServ = "https://www.dir-toolbox.com:8443/toolbox/documentocr.json?documentId=";
      idPdfFromQueryString = getParameterByName('idPdf', document.location.href);
      urlServ = apiServ + idPdfFromQueryString;
    
    console.log('Start ckeditor '+ urlServ);
    // Open a new connection, using the GET request on the URL endpoint
    request.open('GET', urlServ, true);

    request.onload = function () {
        var data = JSON.parse(this.response);
          numPag = document.getElementById('pageNumber').value;
          console.log('Start ckeditor '+ numPag);

        if (request.status >= 200 && request.status < 400) {
        // Begin accessing JSON data here
            for (let index = 0; index < data.payload.length; index++) {
                if (data.payload[index].page == numPag) {
                    textcontent =  data.payload[index].content; 
                    //console.log(data.payload[index].page,data.payload[index].content);
                  }
            }
        } else {
            console.log('error')
        }
    } 
    // Send request
    request.send()
    CKEDITOR.on('instanceReady', function(evt) {
      CKEDITOR.instances.editor.insertText(textcontent);
    });      
  } else {
    editorElement.setAttribute( 'contenteditable', 'true' );
    CKEDITOR.inline( 'editor' );

    // TODO we can consider displaying some info box that
    // without wysiwygarea the classic editor may not work.
  }
};

function isWysiwygareaAvailable() {
  // If in development mode, then the wysiwygarea must be available.
  // Split REV into two strings so builder does not replace it :D.
  if ( CKEDITOR.revision == ( '%RE' + 'V%' ) ) {
    return true;
  }

  return !!CKEDITOR.plugins.get( 'wysiwygarea' );
}

} )();

// %LEAVE_UNMINIFIED% %REMOVE_LINE%

  //resizable.js

  document.addEventListener("DOMContentLoaded", () => {
    //...
    document.getElementById("main").style.width = window.innerWidth + "px";
    document.getElementById("main").style.height = window.innerHeight + "px";

    var sizes = {
      "win1" : 0.5,
      "win3" : 0.75,
      "win4" : 0.5,
      "win6" : 0.4,
      "win11" : 0.8,
      "win9" : 0.5,
      "win13" : 0.4 
    };

    //Resizable.initialise("main", sizes);
    Resizable.initialise("main", {});

  });

  window.addEventListener("resize", () => {
    Resizable.activeContentWindows[0].changeSize(window.innerWidth, window.innerHeight);
    Resizable.activeContentWindows[0].childrenResize();
  });


 