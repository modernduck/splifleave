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
			var url  = "http://leave.splifetech.com/leave/service.php?action=";
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
	.filter("leaveDays", function(){
		return function (minutes)
		{
			console.log("gonna show " + minutes);
			console.log(minutes / (8 * 60))
			return Math.floor( minutes / (8 * 60) );
		}
	})
	.filter("leaveStatus", function(){
		return function( left, leaveItem)
		{

			if(!angular.isObject(leaveItem) && leaveItem != null && (leaveItem.TotalQty -  leaveItem.Used) < left)
				return "ลาเกินสิทธิ์ กรุณาตรวจสอบวันลาอีกครั้ง"
			return "";
		}
	})
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
		var holiday_date = 0;
		return function (date_time_from, date_time_to, holiday_list)
		{

			//Working on it
		/*	date_time_to.setHours(0);
			date_time_from.setHours(0);
			date_time_to.setMinutes(0);
			date_time_from.setMinutes(0);
			var current_day = date_time_from.getDay();
			// 5
			var date_diff = date_time_to.getDate() -  date_time_from.getDate();
			holiday_date += Math.floor(date_diff / 7) * period_holidays.length;
			var last_day = date_diff % 7 
			last_day += current_day;
			if(last_day >= 7)
				holiday_date += period_holidays.length;
			else
				for(var i = 0; i < period_holidays.length; i++)
					if(period_holidays[i] == last_day)
						holiday_date++;
			if(angular.isArray(holiday_list))
			{
				var from_time = date_time_from.getTime();
				var to_time = date_time_to.getTime();
				for(var i =0; i < holiday_list.length ;i +)
				{
					//check if it's not overlap with period_holiday
					for(var j=0; j < period_holidays.length; j++)

				}
			}

*/
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
		var types = [
			{"name" : "ลาป่วย", "value":"01" },
			{"name" : "ลากิจ", "value":"02" },
			{"name" : "ลาพักผ่อน", "value":"03" },
			{"name" : "ลาคลอด", "value":"04" },
			{"name" : "ลาบวช", "value":"05" },
			{"name" : "อื่นๆ", "value":"06" }
		];
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
	.filter("sqlToJsDate", function(){
		return function (sqlDate)
		{
			console.log("====");
			console.log(sqlDate)
			var dateParts = sqlDate.split("-");
			var jsDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2].substr(0,2));
			return jsDate;
		}
	})
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

		}
	}] )
	