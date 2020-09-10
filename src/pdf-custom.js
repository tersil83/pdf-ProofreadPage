(function() {
  var currentPageIndex = 0;
   pdfInstance = null;
   totalPagesCount = 0;
   scale = 1;
   url = 'assets/Seconda_guerra_mondiale.pdf';

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
