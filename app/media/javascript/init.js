(function() {
  var $document, initOffCanvas, load, protocol, scrollCb;

  if (!$.support.transition) {
    $.fn.transition = $.fn.animate;
  }

  protocol = window.location.protocol || document.location.protocol;

  $document = $(document);

  scrollCb = function() {
    return $(".nano").nanoScroller({
      flash: true,
      iOSNativeScrolling: true
    });
  };

  initOffCanvas = function(toggle) {
    var $target, $toggle, data, target;
    $toggle = $(toggle);
    target = $toggle.attr('href');
    $target = $(target);
    data = $toggle.data();
    data.toggle = false;
    return $target.offcanvas(data);
  };

  datepicker_opts = {
      format: 'dd/mm/yyyy',
      language: 'pt-BR'
  };

  datetimepicker_opts = {
      format: 'dd/mm/yyyy HH:mm',
      language: 'pt-BR'
  };

  load = function() {
    var $container, $datatable, $floathead, $icheck, $popovers, $powerange, $sidebarLeft, $tooltips, breakpointDefinition, equalize, responsiveHelper;
    $('#oc-left-toggle').length && initOffCanvas('#oc-left-toggle');
    $('#oc-right-toggle').length && initOffCanvas('#oc-right-toggle');
    window.EmVars.colors = EmVars.colorsFromSass();
    $('.datepick').datepicker(datepicker_opts);
    $('.timepick').timepicker();
    $('.datetimepick').datetimepicker(datetimepicker_opts);
    $('.daterangepick').daterangepicker();
    $('.superbox').SuperBox();
    $('input.rating[type=number]').rating();
    $('[rel=datepicker]').datepicker(datepicker_opts);
    $('[rel=jvfloat]').jvFloat();
    $('[rel=autosize]').autosize();
    $('[rel=tabdrop]').tabdrop({
      text: 'More'
    });
    $('[rel=editable]').editable();
    $('[rel=classselector]').classselector();
    $('[rel=panels]').panels();
    $('[rel=tree]').tree();
    $('[rel=summernote]').summernote();
    $('[rel=selectize]').selectize({
      plugins: ['remove_button'],
      dropdownClass: 'selectize-dropdown animated fadeIn fast'
    });
    $('[rel=selectize-tags]').selectize({
      delimiter: ',',
      persist: false,
      plugins: ['remove_button'],
      dropdownClass: 'selectize-dropdown animated fadeIn fast',
      create: function(input) {
        return {
          value: input,
          text: input
        };
      }
    });
    $icheck = $('[rel=icheck]');
    $icheck.iCheck({
      labelHover: false,
      cursor: true,
      inheritClass: true
    });
    $powerange = $('[rel=powerange]');
    $powerange.each(function() {
      var $this;
      $this = $(this);
      return new Powerange(this, $this.data());
    });
    $('[rel=switch]').each(function() {
      var $this, iswitch;
      $this = $(this);
      iswitch = new Switch(this);
      if (!($this.attr('readonly') || $this.attr('disabled'))) {
        return $(iswitch.el).on('click', function(e) {
          e.preventDefault();
          return iswitch.toggle();
        });
      }
    });

    $floathead = $('table[rel=floathead]');
    $floathead.floatThead({
      scrollContainer: function($tbl) {
        return $tbl.closest($tbl.data('scroll'));
      },
      useAbsolutePositioning: false
    });
    $('#oc-wrapper').on('statechange.bse.offcanvas', function() {
      var cb;
      cb = function() {
        $(window).trigger('resize');
        return $floathead.floatThead('reflow');
      };
      return setTimeout(cb, 360);
    });
    $container = $('#main-oc-container');
    $sidebarLeft = $('#main-oc-sidebar-left');
    equalize = function() {
      var containerHeight, sidebarHeight;
      sidebarHeight = $sidebarLeft.outerHeight(true);
      containerHeight = $container.outerHeight(true);
      if (sidebarHeight > containerHeight) {
        return $container.css({
          height: sidebarHeight
        });
      } else {
        return $container.css({
          height: 'auto'
        });
      }
    };
    equalize();
    $sidebarLeft.find('.collapse').on('shown.bs.collapse hidden.bs.collapse', equalize);
    $('textarea[data-provide=markdown]').each(function() {
      var $this;
      $this = $(this);
      if ($this.data('markdown')) {
        $this.data('markdown').showEditor();
        return;
      }
      return $this.markdown($this.data());
    });
    $('.nestable').nestable({
      group: 'nestable',
      containerSelector: '.dd-list',
      itemSelector: '.dd-item',
      handle: '.dd-handle',
      afterMove: function(placeholder, container) {
        var oldContainer;
        if (oldContainer !== container) {
          if (oldContainer) {
            oldContainer.el.removeClass("active");
          }
          container.el.addClass("active");
          return oldContainer = container;
        }
      },
      onDrop: function(item, container, _super) {
        container.el.removeClass("active");
        return _super(item);
      }
    });
    $('.nav-select').navSelect();
    $('a[href=#]').attr('data-no-turbolink', true);
    scrollCb();
    $('.current-month').text(moment().format('MMMM'));
    $('.current-day').text(moment().format('DD'));
    $('[data-ride=carousel]').on('slide.bs.carousel', function() {
      return setTimeout(function() {
        return $.sparkline_display_visible();
      }, 1);
    });
    $tooltips = $('[data-tooltip-show]');
    $tooltips.tooltip({
      trigger: 'manual'
    }).tooltip("show");
    $popovers = $('[rel="popover-click"]');
    $popovers.popover({
      html: true,
      content: function() {
        return $('#bigdrop').html();
      },
      template: "<div class=\"popover popover-menu popover-grow-shrink\" role=\"tooltip\">\n  <div class=\"arrow\"></div>\n  <h3 class=\"popover-title\"></h3>\n  <div class=\"popover-content no-padding\"></div>\n</div>"
    });
    return $popovers.on('shown.bs.popover', function() {
      var $picheck;
      $picheck = $('.popover-menu [rel=icheck]');
      return $picheck.iCheck({
        labelHover: false,
        cursor: true,
        inheritClass: true
      });
    });
  };

  $(function() {
    FastClick.attach(document.documentElement);
    return load();
  });

  $document.on("shown.bs.modal", function() {
    return $('.modal-blur-content').css({
      polyfilter: 'blur(3px)'
    });
  });

  $document.on("hidden.bs.modal", function() {
    return $('.modal-blur-content').css({
      polyfilter: 'none'
    });
  });

  $document.on("page:load", function() {
    Dropzone._autoDiscoverFunction();
    $('[data-ride="carousel"]').each(function() {
      var $carousel;
      $carousel = $(this);
      return $carousel.carousel($carousel.data());
    });
    return load();
  });

  $document.on('page:fetch', function() {
    return NProgress.start();
  });

  $document.on('page:change', function() {
    return NProgress.done();
  });

  $document.on('page:restore', function() {
    return NProgress.remove();
  });

  $(window).resize(scrollCb);

  $document.on('shown.bs.tab', scrollCb);

  $document.on('shown.bs.tab', function() {
    return $(window).trigger('resize');
  });

  $document.on('shown.bs.tab', function(e) {
    var cb;
    cb = function() {
      return $.sparkline_display_visible();
    };
    return setTimeout(cb, 1);
  });

  $document.tooltip({
    selector: '[rel=tooltip]'
  });

  $document.popover({
    selector: '[rel="popover-sidebar"]',
    trigger: 'hover',
    delay: {
      show: 400,
      hide: 0
    }
  });

  $document.popover({
    selector: '[rel=popover]',
    trigger: 'hover'
  });

  $document.on('click', function(e) {
    var $target;
    $target = $(e.target);
    if ($target.data('toggle') !== 'popover' && $target.parents('[data-toggle="popover"]').length === 0 && $target.parents('.popover.in').length === 0) {
      return $('[data-toggle="popover"]').popover('hide');
    }
  });

  $document.on('click', '#oc-open-chat', function(e) {
    $('#oc-right-toggle').tooltip('show');
    return $('.oc-scroll').animate({
      scrollTop: 0
    }, "slow");
  });

  $document.on('shown.turbocard', '.turbo-placeholder', function(e) {
    return $('.oc-scroll').animate({
      scrollTop: 0
    }, "slow");
  });

}).call(this);

