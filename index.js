$(function() {

    sidebarEvents();

    sidebarLinks();

    function sidebarEvents() {
        $('#hamburger-icon').click(function() {
            openNav();
        });
        $('#closebtn').click(function() {
            closeNav();
        });
    }
    function openNav() {
        if (window.matchMedia('(max-width: 767px)').matches) {
            $("#mySidenav").css({width : "80%"});
        } else {
            $("#mySidenav").css({width : "20%"});
        }
        
    }
    function closeNav() {
        $("#mySidenav").css({width : "0"});
    }

    var searchQuery = "MongoDB";
    var browserPage = '/'+searchQuery+'/1';
    var stateObject = {
        searchQuery : searchQuery,
        pageNo : '1'
    }
    history.pushState(stateObject, null, browserPage);

    prepareBookTabs(searchQuery,'');
    preparePageNumbers();

    function searchAjax(searchQuery,page) {
        var searchResult = "";
        var url = "https://cors-anywhere.herokuapp.com/https://api.itbook.store/1.0/search/"+searchQuery+"/"+page;
        $.ajax({
            url: url, 
            type:'get',
            async:false,
            success: function(result){
                searchResult = result;
            }
        }); 
        return searchResult
    }

    function prepareBookTabs(searchQuery,page) {
        var result = searchAjax(searchQuery,page);
        var template;
        var gotTemplate, gotData;
        gotTemplate = gotData = false;
        var books = result.books;
        var data = {
            books,
            index: function() {
                return ++window['INDEX']||(window['INDEX']=0);
            }
        };

        gotData = true;

        $.get("http://localhost:8080/tmpl-for-tabs.mustache", function( ajaxData, status ) {
            template = ajaxData;
            gotTemplate = true;
            if ( gotData ) processTemplate();
        }); 

        function processTemplate() {
            Mustache.parse(template);
            var rendered = Mustache.render(template, data);
            $('#thumb-row').html(rendered);
            $('#search-haeding').text(searchQuery);
            ratings();
            imgModal();
            for(var i = 0; i < result.books.length; i++) {
                limitTitleText(i);
            }
        }
    }

    function preparePageNumbers() {
        $('#pagination').html("");
        var result = searchAjax(searchQuery,'');
        var total = result.total;
        var totalPages = Math.ceil(total/10);
        var pageLength = [];
        if(totalPages < 11 ) {
            for(var i = 0; i < totalPages; i++){
                pageLength[i] = i+1;
            }
        } else {
            for(var i = 0; i < 10; i++){
                pageLength[i] = i+1;
            }
        }
        pageTemplate(pageLength);
    }

    function pageTemplate(pageLength) {
        var template;
        var gotTemplate, gotData;
        gotTemplate = gotData = false;
        var data = {
            pageLength,
        };
        gotData = true;

        $.get("http://localhost:8080/tmpl-for-pages.mustache", function( ajaxData, status ) {
            template = ajaxData;
            gotTemplate = true;
            if ( gotData ) processTemplate();
        });

        function processTemplate() {
            Mustache.parse(template);
            var rendered = Mustache.render(template, data);
            $('#pagination').html(rendered);
            $('#pagination li').eq(1).addClass('active');
            pagination();
            pageEvents();
        }
    }

    function pagination() {
        $('.pagination li.numbers').click(function() {
            $('.pagination li').removeClass('active');
            $(this).addClass('active');
            var newPage = $('.pagination li.active a').text();
            $('#thumb-row').html("");
            prepareBookTabs(searchQuery,newPage);
            browserPage = '/'+searchQuery+'/'+newPage;
            var stateObject = {
                searchQuery : searchQuery,
                pageNo : newPage
            }
            history.pushState(stateObject, null, browserPage);
        })
    }

    function pageEvents() {
        $('#next-pages').click(function() {
            var result = searchAjax(searchQuery,'');
            var total = result.total;
            var totalPages = Math.ceil(total/10);
            var pageLength = [];
            var lastPage = $('li#next-pages').prev().find('a').text();
            if(lastPage < totalPages) {
                prepareBookTabs(searchQuery,(parseInt(lastPage)+1));
                $('#pagination').html("");
                var nextPages = parseInt(lastPage) + 10;
                if (nextPages <= totalPages) {
                    for(var i = parseInt(lastPage); i < nextPages; i++){
                        pageLength.push(i+1);
                    }
                } else {
                    for(var i = parseInt(lastPage); i < totalPages; i++){
                        pageLength.push(i+1);
                    }
                }
                pageTemplate(pageLength);
            }
        });

        $('#previous-pages').click(function() {
            var pageLength = [];
            var lastPage = $('li#previous-pages').next().find('a').text();
            if(lastPage > 1) {
                prepareBookTabs(searchQuery,(parseInt(lastPage)-1));
                $('#pagination').html("");
                var nextPages = parseInt(lastPage) - 10;
                if (nextPages >= 1) {
                    for(var i = nextPages; i < parseInt(lastPage); i++){
                        pageLength.push(i);
                    }
                }
                pageTemplate(pageLength);
            }
            $('.pagination li').removeClass('active');
            $('#pagination li').eq(10).addClass('active')
        });
    }

    function sidebarLinks() {
        $('.sidebar-links').click(function() {
            closeNav();
            $('.sidebar-links').removeClass('sidebar-active-link');
            $(this).addClass('sidebar-active-link');
            searchQuery = $(this).text();
            $('#thumb-row').html("");
            browserPage = '/'+searchQuery+'/1';
            var stateObject = {
                searchQuery : searchQuery,
                pageNo : '1'
            }
            history.pushState(stateObject, null, browserPage);
            preparePageNumbers();
            prepareBookTabs(searchQuery,'');
        })
    }

    function limitTitleText(value){
        var tabTitle = ($("#limit"+value).text()).toLowerCase();
        var contentLength = tabTitle.length;
        if(contentLength > 60) {
            var shortText = tabTitle.slice(0,60);
            $("#limit"+value).html( shortText+"<span title='"+tabTitle+"'>...</span>")
        }
    }

    function ratings() {
        $('.ratings ul li').click(function() {
            $(this).addClass('checked');
            $(this).prevAll().addClass('checked');
            $(this).nextAll().removeClass('checked');
        })
    }

    function imgModal() {
        $('.book-img').click(function() {
            var img = $(this).attr('src');
            var dataParent = $(this).parent().next();
            var bookTitle = dataParent.find('p.book-title').text();
            var bookDescription;
            var description = dataParent.find('p.limit').find('span').attr('title');
            if(description) {
                bookDescription = description;
            } else {
                bookDescription = dataParent.find('p.limit').text();
            }
            var bookPrice = dataParent.find('div.price-tag').text();
            var bookNumber = dataParent.find('p.book-no').text();
            $('#modal-title').text(bookTitle);
            $('#modal-book-img').attr('src',img);
            $('#img-description').text(bookDescription);
            $('#modal-price-tag').text(bookPrice.trim());
            $('#modal-book-no').text('B.No.: '+bookNumber);

            $('#img-modal').modal('show');
        })
    }

    window.addEventListener('popstate', function(event) {
        var state = event.state;
        if(state) {
            searchQuery = state.searchQuery;
            var pageNo = state.pageNo;
            prepareBookTabs(searchQuery,pageNo);
            $('.sidebar-links').removeClass('sidebar-active-link');
            $('.pagination li').removeClass('active');

            $('.sidebar-links').each(function(element) {
                if($(this).text() == searchQuery) {
                    $(this).addClass('sidebar-active-link');
                }
            });

            $('.pagination li.numbers').each(function(element) {
                if($(this).find('a').text() == pageNo) {
                    $(this).addClass('active');
                }
            })
        }
    });

});