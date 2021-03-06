(function(){
	
	var daysbefore = 5;
	var daysafter = 20;
	

	
	var app = angular.module('calendar', []);
	
	app.value('days_list', []);
	app.value('months_list', []);
	
	app.run(['$rootScope', function($rootScope) {
	// Use jQuery for a synchronous http request -- angular hard-codes all requests to be asynchronous
		/*$.ajax('http://localhost:3000/testcalendar/days_list', {async: false})
		.success(function (data) {
			$rootScope.days_list = [data.sunday, data.monday, data.tuesday, data.wednesday, data.thursday, data.friday, data.saturday];
			
		});
		$.ajax('http://localhost:3000/testcalendar/months_list', {async: false})
		.success(function (data) {
			$rootScope.months_list = [data.january, data.february, data.march, data.april, data.may, data.june, data.july, data.august, data.september, data.october, data.november, data.december];
			
		});*/
		$.ajax('http://localhost:3000/testcalendar/rooms_list', {async: false})
		.success(function (data) {
			$rootScope.rooms_list = data;
			
		});
		
		
	}]);

	
	
		
	app.controller('CalendarController',['$rootScope','$scope', '$http', function($rootScope, $scope, $http) {
		

		//variable that show the reservation form when true
		this.divform = false;
				
		//function called when a empty day is clicked, show the reservation form
		this.showResForm = function(){
			this.divform = true;
		}
		
		this.hideResForm = function(){
			this.divform = false;
		}
		
		this.selectday = function(i, room_id){
			this.selected_date = moment().subtract(daysbefore, 'days').add(i-1, 'days')
			console.log(this.selected_date)
			this.selected_room = room_id
			console.log(this.selected_room)
			console.log($scope.machin)
		}
		
		
		$scope.rooms = $rootScope.rooms_list
		var today = new Date();
		today = today.getTime();
		$rootScope.today = today;
		displayDates = createCalendar(days_list, today) //days_list is defined in template
		$scope.days = displayDates;
		
		
	}]);
	
	app.controller('ReservationsController',['$rootScope', '$scope', '$http',function($rootScope,$scope, $http) {
		this.newReservation = {};
		this.addReservation = function(){
			$http.post('http://localhost:3000/add/reservation', {client_id: this.newReservation.client_id, room_id: this.newReservation.room_id, begin_date: this.newReservation.begin_date, end_date: this.newReservation.end_date}).
				success(function(data, status){
					this.newReservation = {};
					
				}).
				error(function(error, status){
					
				});
		}
		
	}]);

	 app.directive("fillReservTable", ["$compile","$http",  function ($compile, $http) {    

	    return {
	        restrict: "A",
	        
	        link: function (scope, element, attr) {
	            var beginCal = moment.utc().startOf('day').subtract(5, 'day').valueOf();
	            var endCal = moment.utc().startOf('day').add(26, 'day').valueOf();
	            
	            //$http.get('http://localhost:3000/testcalendar/rooms_list').success(function(roomsfetched){
				//	scope.rooms_list = roomsfetched;
				//	for (i=0; i<rooms_list.length ; i++){
	            ADRESS = 'http://localhost:3000/testcalendar/reservations/'+scope.room._id.toString() + '/' + beginCal + '/' + endCal
	            
	            $http.get(ADRESS).success(function(data){
					var html="";
	            	var i=0;
	            	var j=0;
	            	if (data.length == 0) {  // if there is no reservation for this room on this period
						while (i <= scope.days.length){
							if(i==0 || i==scope.days.length) var colspan=1 
				            else var colspan=2
				            
							html+="<td class='emptycell' colspan="+colspan+" ng-click='cal.showResForm(); cal.selectday("+i+", \""+ scope.room._id.toString() +"\");'></td>";
			              
			                i++;
							
						}
					} else { // if there are reservations
					
						while (i <= scope.days.length) {
						if (j < data.length ) {
							this_day = moment.utc(scope.days[i].time).startOf('day');
							res_begin = moment.utc(data[j].begin).startOf('day');
							res_end = moment.utc(data[j].end).startOf('day');
							if (res_begin < this_day && this_day <= res_end){ // si il y a une reservation a la date i
								res_length = res_end.diff(this_day, 'days') + 1 ;						
								if(i==0 || i==scope.days.length) var colspan = res_length*2 -1;
								else var colspan = res_length*2 ;
								html+="<td class='reservation' colspan=" + colspan+">"+ data[j].client_name +"</td>";
				                i += res_length;
				                j++
							
							}else{
								if(i==0 || i==scope.days.length) var colspan=1 
					            else var colspan=2				           
								html+="<td class='emptycell' colspan="+colspan+" ng-click='cal.showResForm(); cal.selectday("+i+", \""+scope.room._id.toString()+"\")'></td>";				                
								i++;
							}
							
						}
						else{
							if(i==0 || i==scope.days.length) var colspan=1 
					        else var colspan=2				           
							html+="<td class='emptycell' colspan="+colspan+" ng-click='cal.showResForm(); cal.selectday("+i+", \""+scope.room._id.toString()+"\")'></td>";				                
							i++;
						}
						}
					}
	            	element.after($compile(html)(scope));
					
				}).error(function(error){
					console.log(error);
				});
	            
	        }
	    };
	}]);
	
	app.directive("createCalHead", ["$compile", "$rootScope",  function ($compile, $rootScope) {    

	    return {
	        restrict: "A",
	        
	        link: function (scope, element, attr) {
				var beginCal = moment.utc().startOf('day').subtract(5, 'day').valueOf();
	            var endCal = moment.utc().startOf('day').add(26, 'day').valueOf();
	            var html="";
	            var dayhtml="";            
	            days = scope.days;
	            colspanyear = 0;
	            colspanmonth = 0;
	            newyear = ""
	            newmonth = ""
	            month = days[0].month
	            year = days[0].year
	            for (i=0; i<days.length; i++){
					if (!newmonth){
						if (days[i].month == month){
							colspanmonth += 2
							
						}else{
							newmonth = days[i].month;
							var colspannewmonth = 2
						}
					}else{
						if (days[i].month == newmonth){
							colspannewmonth += 2
						}
					}
					if (!newyear){
						if (days[i].year == year){
							colspanyear += 2
							
						}else{
							newyear = days[i].year;
							var colspannewyear = 2
						}
					}else{
						if (days[i].year == newyear){
							colspannewyear += 2
						}
					}
					
					dayhtml += "<td colspan=2><p>"+days[i].dayinw +"</p><p>"+days[i].dayinm+"</p></td>"
					
				}
				html += "<tr><th></th><td colspan="+colspanyear+">"+year+"</td>";
				if (newyear) html += "<td colspan="+colspannewyear+">"+newyear+"</td>";
				html += "</tr>";
				html += "<tr><th></th><td colspan="+colspanmonth+">"+ months_list[month] +"</td>"; //months_list is defined in template
				if (newmonth) html += "<td colspan="+colspannewmonth+">"+ months_list[newmonth] +"</td>"; //months_list is defined in template
				html += "</tr>";
				html += "<tr><th>"+dayhtml+"</tr>"
				
				element.after($compile(html)(scope));
				
			}
		}
	}]);	



function createCalendar(list_of_the_days, currentdate)
{
	displayDates = [];
	for (i=-daysbefore;i<=daysafter;i++){
		var dtime = new Date(currentdate + i*24*60*60*1000);
		var date = {
			time: dtime,
			month: dtime.getMonth(),
			year: 1900 + dtime.getYear(),
			dayinw: list_of_the_days[dtime.getDay()].slice(0,3),
			dayinm: dtime.getDate()
		}
		displayDates.push(date);
	}
	return displayDates
}


	
})();

