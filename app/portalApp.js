/**
 * Created by leo on 3/24/15.
 */


var portal =angular
    .module('portalApp', ['openlayers-directive','ui.bootstrap', 'ui.bootstrap.treeview','highcharts-ng','ui.multiselect'])

/**
 * THE BEGINNING OF PORTAL CONTROLLER FUNCTION (MAIN COTROLLER)
 * */
    .controller("portalController",['$scope','$http','shared',function($scope,$http,shared){

        var url = "http://hrhis.moh.go.tz:9090/api/dashboards.json?paging=false";
        $scope.dashboards = null;
        $scope.dashboards = function(){
            $http({
                method: 'GET',
                url: url
            }).success(
                function(data) {
                    $scope.dashboards = data.dashboards;
                });
        };

        $scope.dashboards();

        $scope.antenatal = true;

        $scope.particularDashboard = function(menu,id){

        }
        $scope.particularDashboard("Antenatal Care","Vlw8KFHG4cV");

        }]);
/**
 * THE BEGINNING OF MAP CONTROLLER FUNCTION
 * */
portal.controller("mapController", [ '$scope', '$http', 'olData','olHelpers','shared', function($scope, $http, olData,olHelpers,shared) {


/// indicators URL
    var Indicators = {
        anc_12:'TRoamv0YPt3',
        anc_fisrt:'QiA9L6tNHFy',
        inst:'bzTuXoKa87E',
        post:'S0cn3ephUSs',
        measle:'wM0Lz10TaMU',
        penta3:'U10A7hLOxgq',
        vitaminA:'j1mwtqSyifi',
        child:'uOOJi6b0pzm',
        cervical:'oBTUbnPkrMT'
        //,
        //doctor:'',
        //nurse:'',
        //complete:''

    };

    var ANIC_Before_12_weeks_URL = "http://hrhis.moh.go.tz:9090/api/analytics.json?dimension=dx:TRoamv0YPt3&dimension=pe:2014&filter=ou:lgZ6HfZaj3f&displayProperty=NAME";
    var ANC_first_visit_URL = "http://hrhis.moh.go.tz:9090/api/analytics.json?dimension=dx:oazOp512ShT&dimension=pe:2014&filter=ou:lgZ6HfZaj3f&displayProperty=NAME";
    var Institutional_delivery_URL = "http://hrhis.moh.go.tz:9090/api/analytics.json?dimension=dx:bzTuXoKa87E&dimension=pe:2014&filter=ou:lgZ6HfZaj3f&displayProperty=NAME";
    var Postinatal_care_URL = "http://hrhis.moh.go.tz:9090/api/analytics.json?dimension=dx:S0cn3ephUSs&dimension=pe:2014&filter=ou:lgZ6HfZaj3f&displayProperty=NAME";
    var Measles_vaccination_less_than_12_URL = "";
    var Penta_3_URL = "";
    var Vitamin_A_URL = "";
    var Child_Under_weight_URL = "";
    var Cervical_cancer_screening_URL = "";
    var Doctors_and_AMO_URL = "";
    var Nurse_and_midwives_URL = "";
    var Completeness_URL = "";

    /**
     * THE BEGINNING OF THE FUNCTION THAT HANDLES HOME PAGE FUNCTIONALITY OF MAP
     * */

    (function(){
        $scope.shared = shared;
        shared.facility =3029;
        var pullDistricts = 'http://hrhis.moh.go.tz:9090//api/organisationUnits.json?fields=id,name&level=3';
        //var url = 'portal-module/geoFeatures.json';
        var url = 'portal-module/organisationUnits.geojson';
        var url1 = 'http://hrhis.moh.go.tz:9090/api/geoFeatures.json?ou=ou:LEVEL-4;m0frOspS7JY&displayProperty=NAME&viewClass=detailed';

        $http({
            method: 'GET',
            url: url,
            dataType: "json",
            cache: true,
            ifModified: true
        }).success(
            function(data) {
                var TotalGeo = {
                    "type":"FeatureCollection",
                    "features":[]
                };
                var districtProperties = [];

                var dateObject = new Date();
                $scope.thisyear = dateObject.getFullYear();
                $scope.districts = {};
                $scope.DistrictFreeObject = [];
                angular.forEach(data.features, function (value, index) {
                    var hue = 'rgb(' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ')';
                    // creating dynamic colors for district
                    $scope.saveColorInlocalStorage(value.id,hue);

                    // prepare objects of district for properties to display on tooltip
                    districtProperties[value.id] = {
                        district_id:value.id,
                        year:$scope.thisyear,
                        name:value.properties.name,
                        "color":hue,
                        "facility":Math.floor(Math.random() * 256),
                        "anc_12":0,
                        "anc_fisrt":0,
                        "inst":0,
                        "post":0,
                        "measle":0,
                        "penta3":0,
                        "vitaminA":0,
                        "child":0,
                        "cervical":0,
                        "doctor":0,
                        "nurse":0,
                        "complete":0

                    };

                    $scope.DistrictFreeObject.push(districtProperties[value.id]);
                    $scope.districts[value.id]= districtProperties;

                    // creating geojson object
                    var Object =
                    {
                        "type":"Feature",
                        "id":value.id,
                        "properties":{
                            "name":value.properties
                        },
                        "geometry":{
                            "type":value.geometry.type,
                            "coordinates":value.geometry.coordinates
                        },
                        "style":{
                            fill:{
                                color:$scope.getColorFromLocalStorage(value.id),
                                opacity:5
                            },
                            stroke:{
                                color:'white',
                                width:2
                            }
                        }
                    };
                    TotalGeo.features.push(Object);

                });

                // function getter for district object
                var getColor = function(district){
                    if(!district || !district['district_id']){
                        return "#FFF";
                    }
                    var color = districtProperties[district['district_id']].color;
                    return color;
                }
                var getStyle = function(feature){

                    var style = olHelpers.createStyle({
                        fill:{
                            color:getColor($scope.districts[feature.getId()]),
                            opacity:0.4
                        },
                        stroke:{
                            color:'white',
                            width:2
                        }
                    });
                    return [ style ];

                }

                angular.extend($scope, {
                    Africa: {
                        lat: -6.45,
                        lon: 35,
                        zoom: 5.6
                    },
                    layers:[
                        {
                            name:'mapbox',
                            source: {
                                type: 'TileJSON',
                                url:'http://api.tiles.mapbox.com/v3/mapbox.geography-class.jsonp'
                            }
                        } ,
                        {
                            name:'geojson',
                            source: {
                                type: 'GeoJSON',
                                geojson: {
                                    object: TotalGeo
                                }
                            },
                            style: getStyle
                        }
                    ],defaults: {
                        events: {
                            layers: [ 'mousemove', 'click']
                        }
                    }
                });

                $scope.districts = {};
                angular.forEach($scope.DistrictFreeObject,function(data,index){
                    var district = data;
                    $scope.districts[district['district_id']] = district;
                });


                olData.getMap().then(function(map) {
                    var previousFeature;
                    var overlay = new ol.Overlay({
                        element: document.getElementById('districtbox'),
                        positioning: 'top-right',
                        offset: [100, -100],
                        position: [100, -100]
                    });
                    var overlayHidden = true;
                    // Mouse over function, called from the Leaflet Map Events
                    $scope.$on('openlayers.layers.geojson.mousemove', function(event, feature, olEvent) {
                        $scope.$apply(function(scope) {
                            scope.selectedDistrict = feature ? $scope.districts[feature.getId()] : '';
                            if(feature) {
                                // looping throught indicator types
                                angular.forEach(Indicators,function(value,index){


                                    $http({
                                        method: 'GET',
                                        url: "http://hrhis.moh.go.tz:9090/api/analytics.json?dimension=dx:"+value+"&dimension=pe:"+$scope.thisyear+"&filter=ou:"+feature.getId()+"&displayProperty=NAME",
                                        //url:"portal-module/testIndicatorType.json",
                                        dataType: "json",
                                        cache: true,
                                        ifModified: true
                                    }).success(
                                        function(data) {
                                            var currentDistrict = $scope.districts[feature.getId()];
                                            if(data.rows[0]){
                                                if(value==data.rows[0][0]){

                                                    currentDistrict[index] = data.rows[0][2];
                                                }
                                            }

                                            $scope.districts[feature.getId()] = currentDistrict;
                                        });
                                });
                                scope.selectedDistrict = feature ? $scope.districts[feature.getId()] : '';
                            }
                        });

                        if (!feature) {
                            map.removeOverlay(overlay);
                            overlayHidden = true;
                            return;
                        } else if (overlayHidden) {
                            map.addOverlay(overlay);
                            overlayHidden = false;
                        }
                        overlay.setPosition(map.getEventCoordinate(olEvent));
                        if (feature) {
                            feature.setStyle(olHelpers.createStyle({
                                fill: {
                                    color: '#FFF'
                                }
                            }));
                            if (previousFeature && feature !== previousFeature) {
                                previousFeature.setStyle(getStyle(previousFeature));
                            }
                            previousFeature = feature;
                        }
                    });
                    $scope.$on('openlayers.layers.geojson.featuresadded', function(event, feature, olEvent) {
                        $scope.$apply(function(scope) {
                            if(feature) {
                                $scope.id = feature.getId();
                                scope.selectedDistrict = feature ? $scope.districts[feature.getId()]: '';
                            }
                        });

                    });
                });


            });
        var url = 'https://dhis.moh.go.tz/api/geoFeatures.json?ou=ou:LEVEL-4;m0frOspS7JY&displayProperty=NAME&viewClass=detailed'


        $scope.saveColorInlocalStorage  = function(id,value){

            if(!$scope.getColorFromLocalStorage(id)){
                localStorage.setItem(id , value);
            }
        }

        $scope.getColorFromLocalStorage = function(id){
            var Item = localStorage.getItem( id );
            if(!Item){
                return false;
            }else{
                return Item;
            }

        }
    })();
    /**
     *  THE END
     * */
}]);


/**
 * THE BEGINNING OF ANALYSIS CONTROLLER FUNCTION
 * */



portal.controller("analysisController",['$scope','$http','shared', 'TreeViewService','$timeout',function($scope,$http,shared,TreeViewService,$timeout){
    var indicatorsUrl = "portal-module/indicators.json";
    var orgunitsUrl = "portal-module/organisationUnits_level_1.json";
    $scope.analyticsUrl = null;;
    $scope.arrowUp   = false;
    $scope.arrowDown = true;
    $scope.loading   = true;
    $scope.showForm  = false;
    $scope.message   = "Show the analysis menu";
    $scope.filtervariable = "ou";
    $scope.periods = [];
    $scope.toggleAnalysismenu = function(){
        if($scope.arrowUp){
            $scope.arrowUp = false;
            $scope.showForm = false;
            $scope.message = "Show the analysis menu";
        }else{
            $scope.showForm = true;
            $scope.arrowUp = true;
            $scope.message = "Hide the analysis menu";
        }
        if($scope.arrowDown){

            $scope.arrowDown = false;
        }else{

            $scope.arrowDown = true;
        }
    }
    $scope.getIndicators = function(url,callBack){
        $http({
            method: 'GET',
            url: url
        }).success(callBack);
    }
    $scope.getOrgunits = function(url,callBack){
        $http({
            method: 'GET',
            url: url
        }).success(callBack);
    }

    var getPeriods = function(){
        var periods = [];
        var dateObject = new Date();
        var thisYear = dateObject.getFullYear();
        var milestonYear = 2015;
        var backTracer = 9;

        var elaps = thisYear - milestonYear;
        var begining = 0;
        if(elaps>0){
            newYear= milestonYear+elaps;
            for(var i=0;i<elaps;i++){
                var year = {id:newYear-i,value:newYear-i}
                periods.push(year);
            }
        }
        for(var i=0;i<backTracer;i++){
            var year = {id:milestonYear-i,value:milestonYear-i}
            periods.push(year);
        }
        return periods;
    }
    $scope.getIndicators(indicatorsUrl,function(data) {
        var pagerInfo = data.pager;
        var Indicators = [];
        angular.forEach(data.indicators,function(value,index){

            Indicators.push({name: value.name, indicatorId:value.id});
        });
        $scope.listIndicators = Indicators
        $scope.listperiods = getPeriods();

    });
    $scope.getOrgunits(orgunitsUrl,function(data) {
        var orgunits = data.organisationUnits;
        angular.forEach(orgunits,function(value,index){
        });
        $scope.listOrganisationUnits = orgunits;
    });

    $scope.selectedlistIndicators = [];
    $scope.selectedlistPeriods = [];
    $scope.selectedlistOrgunit = {};
    $scope.jsonObject = {};



    $scope.$watch(function() {
        return TreeViewService.selectedNode;
    }, function() {
        $scope.selectedlistOrgunit = {};
        $scope.selectedlistOrgunit = TreeViewService.selectedNode;
    });

    $scope.$watchCollection(function() {
        return TreeViewService.selectedNodeMultiple;
    }, function() {
        $scope.selectedlistOrgunit = {};
        $scope.selectedlistOrgunit = TreeViewService.selectedNodeMultiple;
    });
    $scope.getDataFromDHISApi = function(selectedlistIndicators,selectedlistPeriods,selectedlistOrgunit){

        var data;
        var periodString = "";
        var periodlength = selectedlistPeriods.length;

        selectedlistPeriods.sort();
        angular.forEach(selectedlistPeriods,function(value,index){
            if(index==periodlength-1){

                periodString+=value.value;
            }else{
                periodString+=value.value+";"
            }
        });
        var indicatorString = "";

        var indicatorlength = selectedlistIndicators.length;
        angular.forEach(selectedlistIndicators,function(value,index){
            if(index==indicatorlength-1){
                indicatorString+=value.indicatorId;
            }else{
                indicatorString+=value.indicatorId+";"
            }
        });


        var orgunitString = "";
        var orgunitlength = selectedlistOrgunit.length;
        if(orgunitlength>=1){
            angular.forEach(selectedlistOrgunit,function(value,index){
                if(index==orgunitlength-1){
                    orgunitString+=value.id;
                }else{
                    orgunitString+=value.id+";"
                }
            });
        }else{
            orgunitString = selectedlistOrgunit.id;
        }
        if(!orgunitString){
            orgunitString = "m0frOspS7JY";
        }

        $scope.filtervariable="period";
        if($scope.filtervariable=="period"){

            $scope.analyticsUrl = "/api/analytics.json?dimension=dx:"+indicatorString+"&dimension=ou:"+orgunitString+"&filter=pe:"+periodString+"&displayProperty=NAME";

        }else{
            $scope.analyticsUrl = "/api/analytics.json?dimension=dx:"+indicatorString+"&dimension=pe:"+periodString+"&filter=ou:"+orgunitString+"&displayProperty=NAME";

        }
        $scope.filtervariable="period";
        $scope.PrepareTableData = function(data){

            if($scope.filtervariable=="period"){
                var orgUnits = [];
                var dataObject = [];
                var markedDx = null;
                var indicatorLength  = $scope.selectedlistIndicators.length;

                if(data.rows.length>0){
                    var selectedIndLength = $scope.selectedlistIndicators.length;
                    var orgunitLength = data.metaData.ou.length;
                    var orgCounter = 0;
                    var roundCounter = 0;


                    angular.forEach($scope.selectedlistOrgunit,function(value,index){
                        var uid  = value.id;
                        var name = value.name;
                        var singleOb =  getSingleOrgObject(uid,name,$scope.selectedlistIndicators,data.rows);
                        dataObject.push(singleOb);
                    });

                    function getSingleOrgObject(orgUnitUID,name,selectedInd,dataRows){
                        var ob = {};
                        var indicatorCounter = 1;
                        ob['org'] = name;
                        angular.forEach($scope.selectedlistIndicators,function(value,index){
                            //objectIndex
                            var indicator  = value.indicatorId;
                            angular.forEach(data.rows,function(value,index){
                                if(value[0]==indicator&&value[1]==orgUnitUID){
                                    ob['indicator'+indicatorCounter]=value[2];
                                    indicatorCounter++;
                                }
                            });
                        });

                        return ob;
                    }

                }
            }else{

            }
            $scope.loading = false;
            return dataObject;
        }

        $scope.PrepareChartData = function(data){
            var seriesArray = {ob:"",pie:"",polar:""};
            var headers = [];
            $scope.categories = [];
            angular.forEach($scope.selectedlistIndicators,function(value,index){
                $scope.categories.push(value.name);
            });
            var seriesObjectOther = [];
            angular.forEach(data,function(value,index){
                var dataValues = [];
                angular.forEach(value,function(valueInd,indexInd){
                    if(indexInd!=="org"){
                        dataValues.push(parseInt(valueInd));
                    }


                });
                var series = {name:value.org,data:dataValues};
                seriesObjectOther.push(series);
            });
            seriesArray.ob = seriesObjectOther;

            var seriesObjectPolar = [];
            angular.forEach(data,function(value,index){
                var dataValues = [];
                angular.forEach(value,function(valueInd,indexInd){
                    if(indexInd!=="org"){
                        dataValues.push(parseInt(valueInd));
                    }


                });
                var series = {pointPlacement:"on",name:value.org,data:dataValues};
                seriesObjectPolar.push(series);
            });
            seriesArray.polar = seriesObjectPolar;
            var seriesObjectpie = [];
            $scope.lengthD = data.length;
            angular.forEach(data,function(value,index){
                var dataOb = [];
                var indcIndex = 0;
                angular.forEach(value,function(valueX,indexX){
                    if(indexX=='org'){}else{
                        if(valueX==null){valueX=0;}
                        data = {
                            name: $scope.categories[indcIndex],
                            y: parseInt(valueX),
                            color:'rgb(' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ')'

                        }

                        indcIndex++;
                        dataOb.push(data);
                    }
                });
                var raw = {
                    type: 'pie',
                    name: value.org,
                    data: dataOb,
                    center: null,
                    size: 100,
                    showInLegend: true,
                    dataLabels: {
                        enabled: false
                    }
                };
                if($scope.lengthD<=1){
                    raw.size = 250;

                }
                seriesObjectpie.push(raw);
            });
            var countCharts = 0;
            if($scope.lengthD<=1){
                var initialX = 500;
                var initialY = 100;

            }else{
                var initialX = 110;
                var initialY = 30;
            }

            var rounds = 0;
            var pieSize = 200;
            var PreViX = initialX;
            var PrevY = initialY;
            //Algorithm for positioning of pie charts
            angular.forEach(seriesObjectpie,function(valueX,indexX){
                var center = [initialX,initialY];
                var testCenter = [initialX,initialY];

                if(countCharts>3){

                    PrevY = PrevY+pieSize;
                    PreViX = initialX;
                    testCenter = [PreViX,PrevY];
                    PrevY = PrevY;
                    rounds++;
                    countCharts=0;
                }else{
                    testCenter = [PreViX,PrevY];
                    PreViX = PreViX+pieSize;
                }
                valueX.center=testCenter;
                seriesObjectpie[indexX] = valueX;
                countCharts++;
            });
            seriesArray.pie = seriesObjectpie;

            return seriesArray;
        }


        $http({
            method: 'GET',
            url: "http://hrhis.moh.go.tz:9090"+$scope.analyticsUrl,
            dataType: "json",
            cache: true,
            ifModified: true
        }).success(
            function(data) {
                $scope.dataForDisplayingTable = $scope.PrepareTableData(data);
                $scope.chartSeriesArray = $scope.PrepareChartData($scope.dataForDisplayingTable);
                $scope.chartSeries = $scope.chartSeriesArray.ob;
                $scope.pieSeries = $scope.chartSeriesArray.pie;
                $scope.polarSeries = $scope.chartSeriesArray.polar;


                $scope.$watch(function() {
                    return $scope.dataForDisplayingTable;
                }, function() {
                });


            });

    }

    var checker = 0;
    $scope.getReport = function(reportType,otherInfo){
        $scope.chartType = otherInfo;
        $scope.chartConfig = {
            xAxis: {
                categories: $scope.categories,
                title: {
                    text: null
                }
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Population',
                    align: 'high'
                },
                labels: {
                    overflow: 'justify'
                }
            },
            tooltip: {
                valueSuffix: ' millions'
            },
            options: {
                chart: {
                    type: otherInfo
                },
                plotOptions: {
                    series: {
                        stacking: ''
                    }
                }
            },
            series:  ((otherInfo=="pie")? $scope.pieSeries : $scope.chartSeries),
            title: {
                text: 'Hello'
            },
            credits: {
                enabled: true
            },
            loading: false,
            size: {}
        };
var periodString = "";
angular.forEach($scope.selectedlistPeriods,function(value,index){
    console.log(value);
    periodString +=value.value+";"
});
        $scope.chartConfig.title.text = "Indicator Distribution based on Organisation unit(s) for the year(s) :"+periodString;

        if(reportType=="table"){
            $scope.table = true;
            $scope.chart = false;
            $scope.map   = false;
        }

        if(reportType=="chart"){
            $scope.table = false;
            $scope.chart = true;
            $scope.map   = false;

            $scope.$watch(function() {
                return $scope.chartSeries;
            }, function() {
            });

            $scope.$watch(function() {
                return $scope.pieSeries;
            }, function() {

            });

        }
        if(reportType=="chart"){
            $scope.table = false;
            $scope.chart = true;
            $scope.map   = false;

            $scope.$watch(function() {
                return $scope.chartSeries;
            }, function() {
            });

            $scope.$watch(function() {
                return $scope.pieSeries;
            }, function() {

            });

        }

        // Getting selected Indicators
        $scope.headers = [];
        $scope.headers[0] = "Organisation Units";
        $scope.$watch(function() {
            return $scope.selectedlistIndicators;
        }, function() {

            });

        if($scope.selectedlistIndicators.length<1){

            $scope.selectedlistIndicators = [
                {name: "ANC 1st visit coverage", indicatorId: "oazOp512ShT"},
                {name: "ANC 4th visits Coverage", indicatorId: "QiA9L6tNHFy"},
                {name: "ANC Anaemia Prevalance", indicatorId: "JT9AlIbDl1H"},
                {name: "ANC IPT 1 coverage", indicatorId: "aw1jQ1tJTmE"},
                {name: "ANC IPT 2 coverage", indicatorId: "i47jm4Pkkq6"}];

        }
        if($scope.selectedlistPeriods.length<1){

            $scope.selectedlistPeriods = [{"id":2015,"value":2015}];

        }


        if($scope.selectedlistOrgunit.length<1){

            $scope.selectedlistOrgunit = [{
                "id":"m0frOspS7JY",
                "name":"MOH - Tanzania"
            }];

        }

        $scope.$watch(function() {
            return $scope.selectedlistOrgunit;
        }, function() {
            $scope.getDataFromDHISApi($scope.selectedlistIndicators,$scope.selectedlistPeriods,$scope.selectedlistOrgunit);

        });

        $scope.$watch(function() {
            return $scope.selectedlistPeriods;
        }, function() {
            $scope.getDataFromDHISApi($scope.selectedlistIndicators,$scope.selectedlistPeriods,$scope.selectedlistOrgunit);

        });

        $scope.$watch(function() {
            return $scope.selectedlistIndicators;
        }, function() {
            $scope.getDataFromDHISApi($scope.selectedlistIndicators,$scope.selectedlistPeriods,$scope.selectedlistOrgunit);

        });

        $scope.getDataFromDHISApi($scope.selectedlistIndicators,$scope.selectedlistPeriods,$scope.selectedlistOrgunit);

    }


    $timeout(function () {
        $scope.getReport('table','');
    }, 2000);
    $scope.getReport('table','');


    $scope.mapIndicators = $scope.selectedlistIndicators;
    $scope.getMap = function(){
        $scope.table = false;
        $scope.chart = false;
        $scope.map   = true;
            $scope.mapIndicators = $scope.selectedlistIndicators;

    }



}]);
portal.directive('analysisTable',function(){
    return {
        link:function($scope,element,attrs){

            $scope.$watchCollection(function() {return $scope.dataTabs;}, function(val) {

            });
            $scope.$watch(function() {return $scope.titles;}, function(val) {

            });
            $scope.$watch(function() {return $scope.headers;}, function(val) {

            });
        },
        scope: {
            dataTabs: "=data",
            titles: "=title",
            loading: "=load",
            periods: "=periods",
            headers: "=header"
        },
        restrict:"E",
        replace: true,
        templateUrl:"portal-module/directives/table-directive.html"
    }


});
portal.directive('analysisMap',function(){
    return {
        link:function($scope,element,attrs){
            $scope.$watch(function() {
                return $scope.indicators;
            }, function() {
                console.log("indicators");
                console.log($scope.indicators);
            });
        },
        scope: {
            indicators: "=selectedDx"
        },
        restrict:"E",
        replace: true,
        templateUrl:"portal-module/directives/map-directive.html"
    }
});
/**
 * THE BEGINNING OF DASHBOARDS CONTROLLER FUNCTION
 * */
portal.controller("dashboardController",['$scope','$http','shared',function($scope,$http){

}]);


portal.factory('shared', function() {
    var shared = {
        "facility":0
    };
    return shared;
})
