var SERVICE_PATH = "http://leave.splifetech.com/leave/service.php";
var Config = {
	errorText : "ลาเกินสิทธิ์ ",
	leaveTypes : [
			{"name" : "ลาป่วย", "value":"01" },
			{"name" : "ลากิจ", "value":"02" },
			{"name" : "ลาพักผ่อน", "value":"03" },
			{"name" : "ลาคลอด", "value":"04" },
			{"name" : "ลาบวช", "value":"05" },
			{"name" : "อื่นๆ", "value":"06" }
	],

}

angular.module("sick",['ui.bootstrap', 'leave.controller'])

angular.module("sick.filter", [])
	.filter('http_params_str', function(){
		return function (params)
		{
			var str ="";
			var counter = 0;
			for(var key in params)
			{
				if(counter > 0)
					str += "&";
				str += "params["+key+"]="+params[key];
				counter++;
			}
			return str;
		}
	})
	.filter("http_request_url", [ "$filter", function ($filter){
		return function(action, table, params)		
		{
			if(angular.isObject(params))
				var params_str = $filter('http_params_str')(params);
			else
				var params_str ="";
			var url  = SERVICE_PATH + "?action=";
			url = url + action;
			url = url +"&table=" + table;
			if(params_str.length > 0)
				url += "&" + params_str
			return url
		}
	}])
	.filter("minToDays", function(){
		return function (minutes)
		{
			var days = minutes/60
			days = days/8
			return Math.floor(days * 10)/10;
		}
	})
	.filter("daysToMins", function(){
		return function (days)
		{
			var minutes = days * 8 * 60;
			return minutes;
		}
	})
	.filter("leaveDays", function(){
		return function (minutes)
		{
			console.log("gonna show " + minutes);
			console.log(minutes / (8 * 60))
			return Math.floor( minutes / (8 * 60) );
		}
	})
	.filter("leaveStatus", ['$filter', function($filter){
			return function( left, leaveItem)
			{
				var extra = "";
				if(leaveItem != null )
				{
					console.log( (leaveItem.TotalQty -  leaveItem.Used) )
					extra +=  (leaveItem.TotalQty -  leaveItem.Used)
				}
				if(leaveItem != null && (leaveItem.TotalQty -  leaveItem.Used) < left)
					return COnfig.errorText + $filter('minToDays')(leaveItem.TotalQty -  leaveItem.Used) +" วัน กรุณาตรวจสอบวันลาอีกครั้ง"
				return "";
			}
		}])
	.filter("leaveHours", function(){
		return function (minutes)
		{
			var ceil_hours = Math.floor(minutes/60);
			return ceil_hours  % 8;
		}
	})
	.filter("leaveMinutes", function(){
		return function (minutes)
		{
			return minutes % 60;
		}
	})

	.filter("timeHoliday", function(){
		var period_holidays = [0, 6];
		
		return function (date_time_from, date_time_to, holiday_list)
		{
			console.log('do time holiday')
			//Working on it
			var holiday_date = 0;
			date_time_to.setHours(0);
			date_time_from.setHours(0);
			date_time_to.setMinutes(0);
			date_time_from.setMinutes(0);
			var current_day = date_time_from.getDay();
			// 5
			var _diff_days = date_time_to.getTime() - date_time_from.getTime() ;
			var date_diff = Math.ceil(_diff_days / (1000 * 3600 * 24));
			//var date_diff = date_time_to.getDate() -  date_time_from.getDate();
			holiday_date += Math.floor(date_diff / 7) * period_holidays.length;
			var last_day = date_diff % 7 
			last_day += current_day;
			if(last_day >= 7)
				holiday_date += period_holidays.length;
			else
				for(var i = 0; i < period_holidays.length; i++)
					if(period_holidays[i] == last_day)
						holiday_date++;
			console.log('period_holidays :' + holiday_date);
			if(angular.isArray(holiday_list))
			{
				console.log('gonna deduc')
				var from_time = date_time_from.getTime();
				var to_time = date_time_to.getTime();
				for(var i =0; i < holiday_list.length ;i++)
				{
					var isOverLap = false;
					//check if it's not overlap with period_holiday
					for(var j=0; j < period_holidays.length && !isOverLap; j++)
						isOverLap = (period_holidays[j] == holiday_list[i].getDay() );
					console.log('holiday : ' + i + " isOverLap : " + isOverLap);
					if(!isOverLap && from_time <= holiday_list[i].getTime() && to_time >= holiday_list[i].getTime())
					{
						holiday_date++;
					}
				}
			}
			return holiday_date;

		}
	})
	.filter("timeDifferent", function(){
		var sum_minutes_max = 17 * 60;
		var sum_minutes_min = 8 * 60;
		return function ( date_time_from,date_time_to, time_from, time_to)
		{
			var _diff_days = date_time_to.getTime() - date_time_from.getTime() ;
			var diff_days = Math.ceil(_diff_days / (1000 * 3600 * 24));
			console.log(diff_days);
			console.log('from time ' + time_from.getHours() + " : " + time_from.getMinutes());
			console.log('to time ' + time_to.getHours() + " : " + time_to.getMinutes());
			var used_mins = 0
			if(diff_days == 0)
			{
				//only hours
				used_mins  = (time_to.getHours() * 60 + time_to.getMinutes()) - (time_from.getHours() * 60 + time_from.getMinutes());
				if(time_to.getHours() >= 13)
					used_mins -= 1 * 60;
			}else if(diff_days == 1)
			{
				used_mins = sum_minutes_max - (time_from.getHours() * 60 + time_from.getMinutes());
				console.log("first day :" + used_mins)
				used_mins += (time_to.getHours() * 60 + time_to.getMinutes())  - (sum_minutes_min);
				console.log("second day:" + ((time_to.getHours() * 60 + time_to.getMinutes())  - (sum_minutes_min)) );
				if(time_from.getHours() <= 11)
					used_mins -= 1 * 60;
				console.log('deduct#1?' + used_mins);
				if(time_to.getHours() >= 13)
					used_mins -= 1 * 60;
				console.log('deduct#2?' + used_mins);
				//might be hours again
			}else if(diff_days < 0)
			{
				//error
			}else
			{
				
				used_mins = (diff_days -1) * 8 * 60 ;
				used_mins += sum_minutes_max - (time_from.getHours() * 60 + time_from.getMinutes());
				used_mins += (time_to.getHours() * 60 + time_to.getMinutes())  - (sum_minutes_min);
				if(time_from.getHours() <= 11) 
					used_mins -= 1 * 60;
				if(time_to.getHours() >= 13)
					used_mins -= 1 * 60;
			}


			return used_mins;

		}

	})

	.factory("LeaveTypes", function(){
		var types = Config.leaveTypes;
		return {
			getNormal : function()
			{
				var ans =  []
				for(var i = 0; i < 3; i++)
					ans.push(types[i])
				return ans;
			},
			isSickLeave : function(selectedType)
			{
				if(selectedType.LeaveType == types[0].value)
					return true;
				return false;
			},

			get : function()
			{
				return types;
			}
		}
	})
	.filter("leaveType",["LeaveTypes", function(LeaveTypes){
			return function (type)
			{
				var types = LeaveTypes.get();
				var answers = [];
				for(var i = 0; i < types.length; i++)
				{
					answers[types[i]["value"]] = types[i]["name"]

				}
				return answers[type];
			}
		}])
	

	.filter("isFromMainSite", function(){
		return function (user)
		{
			return user.Site == "HO";
		}
	})
	.filter('filterHolidayListForMainSite', ['$filter', function ($filter){
			return function (holidays)
			{
				var _holidays = $filter('filter')(holidays, {HO:"1"});
				var holiday_list = [];
				for(var i =0; i < _holidays.length; i++)
				{
					holiday_list.push($filter('sqlToJsDate')(_holidays[i].HolidayDate));
				}
				return holiday_list;
			}
		}])

	.filter("minDate", function(){
		return function (date1, date2)
		{
			if(date1.getTime() > date2.getTime())
				return date2;
			else 
				return date1;
		}
	})
	.filter("maxDate", function(){
		return function (date1, date2)
		{
			if(date1.getTime() > date2.getTime())
				return date1;
			else 
				return date2;
		}
	})
	.filter("stringDigit", function(){
		return function (number, targetLength) {
			if(angular.isUndefined(targetLength))
				targetLength = 2;
		    var output = number + '';
		    while (output.length < targetLength) {
		        output = '0' + output;
		    }
		    return output;
		}
	
	})
	.filter("sqlToJsDate", function(){
		return function (sqlDate)
		{
			
			var dateParts = sqlDate.split("-");
			var jsDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2].substr(0,2));
			console.log(jsDate);
			return jsDate;
		}
	})
	.filter("jsDateToSqlDate",["$filter", function ($filter){
			return function (jsDate)
			{
				var str_year = $filter('stringDigit')(jsDate.getFullYear());
				var str_month = $filter('stringDigit')(jsDate.getMonth() + 1);
				var str_date = $filter('stringDigit')(jsDate.getDate());
				return str_year + "-" + str_month + "-"+str_date;
			}
		}])
	.filter("jsTimeToSqlTime", ["$filter", function ($filter){
		return function (jsTime)
		{
			var hours = $filter('stringDigit')(jsTime.getHours());
			var minutes = $filter('stringDigit')(jsTime.getMinutes());
			var second = $filter('stringDigit')(jsTime.getSeconds());
			return hours+":"+minutes+":"+second;
		}
	}])
	.filter("documentId", ["$filter", function ($filter){
			return function (id)
			{
				var d = new Date();
				var thai_year = d.getYear() + 2443;
				thai_year = thai_year+""
				var prefix = thai_year.substring(2,4)
				var string_id = $filter("stringDigit")(id, 5);
				return prefix + string_id;
			}
		}])

angular.module('sick.model', [])
	.factory("Query", ["$http", "$filter", function ($http, $filter){
		
		return {
			get : function(table, params, callback)
			{
				var url = $filter('http_request_url')("get", table ,params)
				console.log(url)
				$http.get(url).success(callback);
				return true;
			},
			query :  function(table, params, callback)
			{
				var url = $filter('http_request_url')("query", table ,params)
				console.log(url)
				$http.get(url).success(callback);
				return true;
			},
			lastId : function(table, params, callback)
			{
				var url = $filter('http_request_url')("last_id", table ,params)
				$http.get(url).success(callback);
			},
			create : function(table, params, callback)
			{
				$http.post(SERVICE_PATH, {table:table, action:"create", params:params}).success(callback);
			}

		}
	}] )
	