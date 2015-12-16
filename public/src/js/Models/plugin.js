define(function(require){

    var CTC = {};
    var mockJson = require('inputData/plugin_JSON_Mock'),
        Template = require('text!../../templates/plugin_template.hbs'),
        _ = require("lodash"),
        $ = require('jquery'),
        slick = require('slick'),
        mustache = require('mustache');


    /**
    *CTCPlugin
     * */
    var CTC = (function (ctc) {

        ctc.modules = ctc.modules || {};

        /*for Jasmine test*/
        ctc.tests = ctc.tests || {};
        /*for Jasmine test*/

        var Plugin = function(opts) {
            console.log('Component: "PA Colour Array"');

            var MAX_ITEM_FOR_CENTER = 5,
                $self = $('.pa-colour-array-component'),
                brandPath = $self.data("brand-path"),
                //defaultColourFamilyPath = $self.data("default-colour-family"),
                //splitedPath = defaultColourFamilyPath.split("/"),
                defaultColourFamilyName = "";

            var tmpl = $('#module').html(),
                verticalScroll;

            var holders = {
                "root"             : ".pa-colour-array-component",
                "filterItemWrapper": ".pa-color-array_filter_item_wrapper",
                "filterItem"       : '.pa-color-array_filter_item',
                "filterItemBorder" : '.pa-color-array_filter_item_border',
                "collorArrayFilter": ".pa-color-array_filter",
                "palletesWrapper"  : ".pa-color-array_palletes_wrapper",
                "palleteItem"      : '.pa-color-array_pallete',
                "palleteItemBorder":".pa-color-array_pallete_item_border",
                "palleteItemColorWrapper" : '.pa-color-array_pallete_item_color_wrapper',
                "colourArrayFilterWrapper": ".pa-color-array_filter_wrapper",
                'colourArrayPayloadItem'  : '.pa-color-array_pallete_item_color'
            };

            var holdersClass = {
                "filterItemBorderHide": 'pa-color-array_filter_item_border__hide',
                "showPallete": "show-pallete",
                "palleteColorBorder_hide": "pa-color-array_pallete_item_border__hide",
                "wrapperNoScroll": "pa-color-array_filter_wrapper__no-scroll",
                "scrolledWrapper": "scroll"
            };

            initialize();

            function initialize(){
                var view = render(mockJson);

                $self.append(view);

                events();
                if(defaultColourFamilyName){
                    setActiveColourFamily(defaultColourFamilyName);
                } else if(mockJson.coloursFamilies.length){
                    setActiveColourFamily(mockJson.coloursFamilies[0].name);
                }
                initHorizontalScroll();
                //initVerticalScroll();
            }

            function render(colourArray) {
                var filteredJson = parserJson(colourArray);
                var view = mustache.compile(Template)({'result':filteredJson});
                $(holders.root).append(view);

               // return CTC.utils.dust.renderTemplate("pa-colour-array", {colourFamilies: filteredJson});
            }

            function parserJson(json){
                var groupColors = [];

                _.each(json.coloursFamilies, function(coloursFamily){

                    var obj = {};
                    obj.id = coloursFamily.name;
                    obj.filterTitle = null;
                    obj.nameEn = coloursFamily.titleEn;
                    obj.nameFr = coloursFamily.titleFr;
                    obj.filterColor = "rgb("+ coloursFamily.red + "," + coloursFamily.green + "," + coloursFamily.blue + ")";
                    obj.filterPallete = [];


                    _.each(json.colours, function(oneElem){
                        if(coloursFamily.name == oneElem.family){
                            obj.family = oneElem.family;
                            var color = { 'rgb': "rgb("+ oneElem.red + "," + oneElem.green + "," + oneElem.blue + ")" , 'code' : oneElem.code};
                            obj.filterPallete.push(color);
                        }
                    });

                    groupColors.push(obj);
                });

                return groupColors;
            }

            function events() {
                $(holders.filterItemWrapper).click(selectFilterItem);
                $(holders.palleteItemColorWrapper).click(selectItemColor);
            }

            function setActiveColourFamily(colourFamilyName) {

                var familyNameAttrSelector = "[data-family-name='" + colourFamilyName + "']";

                $self.find(holders.filterItemBorder).addClass(holdersClass.filterItemBorderHide);
                $self.find(holders.filterItemWrapper + familyNameAttrSelector)
                    .find(holders.filterItemBorder).removeClass(holdersClass.filterItemBorderHide);

                $self.find(holders.palleteItem).removeClass(holdersClass.showPallete);
                $self.find(holders.palleteItem + familyNameAttrSelector).addClass(holdersClass.showPallete);
            }

            function selectFilterItem(e) {
                var current = e.currentTarget,
                    selectedFamilyName = $(current).attr("data-family-name");

                setActiveColourFamily(selectedFamilyName);
                //refreshVerticalScroll();
            }

            function initHorizontalScroll() {
                var countItems = $(holders.filterItemWrapper).length,
                    $item = $(holders.filterItemWrapper),
                    $wrapper = $(holders.collorArrayFilter),
                //DUE design feature (last item is displayed at the half)
                    SLIDE_TO_SHOW_REDUCTION = 2;

                //if all items can't fit in wrapper wrapper width setting dynamically
                if (countItems <= MAX_ITEM_FOR_CENTER) {
                    setWrapperWidth($item, $wrapper);
                }

                //define position of selected item, which define in  'Author mode'
                function centerShift(){
                    var slickIndex = 0;

                    $(holders.filterItemWrapper).each( function (i, item) {
                        var itemDataFamily = $(item).attr("data-family-name")
                        if (itemDataFamily == defaultColourFamilyName){
                            slickIndex = i;
                        }
                    });

                    return slickIndex;
                }

                //in adding class define additional styles for slider
                $(holders.colourArrayFilterWrapper).addClass(holdersClass.scrolledWrapper);


                 $(holders.collorArrayFilter).on("initholders.colourArrayFilterWrapper", function(){
                 //in adding class define additional styles for slider
                 $(".pa-color-array_filter_item_wrapper").addClass("pa-color-array_filter_item_wrapper_shift");
                 })

                 $(holders.collorArrayFilter).slick({
                    initialSlide: centerShift(),
                    slidesToShow: countItems - SLIDE_TO_SHOW_REDUCTION,
                    centerMode: true,
                    swipeToSlide: true,
                    arrows: false,
                    speed: 500,
                    focusOnSelect: true,
                    slide: holders.filterItemWrapper,
                    variableWidth: true,
                    infinite: true
                });
            }

            /**
             * set width for wrapper
             * @param item {jQuery}  inner item in wrapper
             * @param wrapper {jQuery}  wrapper which will be setting width
             **/
            function setWrapperWidth($item, $wrapper){
                var countItems = $item.width();
                var widthItem = $item.length;
                var newWrapperWidth = (countItems * widthItem);

                $wrapper.width(newWrapperWidth);
            }

            function initVerticalScroll() {
                var el = $(holders.palletesWrapper).get(0);
                verticalScroll = new IScroll(el, {
                    mouseWheel: true,
                    scrollbars: false,
                    scrollX: false,
                    scrollY: true,
                    click: false,
                    preventDefaultException: {
                        tagName: /.*/
                    }
                });
            }

            function refreshVerticalScroll() {
                verticalScroll.refresh();
            }

            function selectItemColor(e){
                $(holders.palleteItemBorder).addClass(holdersClass.palleteColorBorder_hide);
                var $border = $(e.currentTarget).find(holders.palleteItemBorder).removeClass(holdersClass.palleteColorBorder_hide);
                var colourCode = $(e.currentTarget).find(holders.colourArrayPayloadItem).data('colour-code');
            }
        };

        Plugin.prototype = {
            defaults: {
                selector: '.pa-colour-array-component'
            }
        };
        /*	$.plugin('Plugin', Plugin);*/
        ctc.modules.Plugin = Plugin;

        /*for Jasmine test*/
        ctc.tests.Plugin = Plugin;
        /*for Jasmine test*/

        return ctc;
    }(CTC));

    /**
     * CTCPlugin
     **/

    return CTC;
});