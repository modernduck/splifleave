var SERVICE_PATH = "./service.php";

var Config = {
	errorText : "ลาเกินสิทธิ์ กรุณาตรวจสอบวันลาอีกครั้ง",
	leaveTypes : [
			{"name" : "ลาป่วย", "value":"01" },
			{"name" : "ลากิจ", "value":"02" },
			{"name" : "ลาพักผ่อน", "value":"03" },
			{"name" : "ลาคลอด", "value":"04" },
			{"name" : "ลาบวช", "value":"05" },
			{"name" : "อื่นๆ", "value":"06" },
			{"name" : "ยกเลิกลาป่วย", "value":"11", "from":"01" },
			{"name" : "ยกเลิกลากิจ", "value":"12", "from":"02" },
			{"name" : "ยกเลิกลาพักผ่อน", "value":"13", "from":"03" },
			{"name" : "ยกเลิกลาคลอด", "value":"14", "from":"04" },
			{"name" : "ยกเลิกลาบวช", "value":"15", "from":"05" },
			{"name" : "ยกเลิกอื่นๆ", "value":"16", "from":"06" },
	],
	cancleLeaveTypes: [
		{"name" : "ยกเลิกลาป่วย", "value":"11", "from":"01" },
		{"name" : "ยกเลิกลากิจ", "value":"12", "from":"02" },
		{"name" : "ยกเลิกลาพักผ่อน", "value":"13", "from":"03" },
		{"name" : "ยกเลิกลาคลอด", "value":"14", "from":"04" },
		{"name" : "ยกเลิกลาบวช", "value":"15", "from":"05" },
		{"name" : "ยกเลิกอื่นๆ", "value":"16", "from":"06" },	
	],
	MESSAGES : {
		"saveForm": "ได้ทำการส่งใบลาเรียบร้อยแล้วค่ะ",
		"suffixApprove" : "เรียบร้อยแล้วค่ะ"
	},
	leaveOtherTypes : [
		{"name" : "ลาคลอด", "value":"04", maxCount:90 },
		{"name" : "ลาบวช", "value":"05",  minWorkYears:2, alertMessage:"อายุการทำงานน้อยกว่า2ปีไม่อาจลาบวชได้" },
		{"name" : "อื่นๆ", "value":"06" },
	],
	leaveOtherType : "06",
	leavePregnantType : "04",
	leaveMonkType : "05",
	rangeSickLeave: 7,
	rangeWorkLeave: 30,
	mainSite : "HO",
	mininumLeaves : {
		"01":(4 * 60),
		"02":30,
		"03":(4 * 60),
		"04":(8 * 60),
		"05":(8 * 60),
		"06":30,
	},
	STATUS :{
		"DRAFT":1,
		"SENDED":2,
		"CANCLED":7,
		"APPROVED":3,
		"DENIED":4,
		"REJECTED":5,
		"ACKNOWLEDGED":6,
		
	},
	status_names : {
		1 : "DRAFT",
		2 : "WAITING",
		3 : "APPROVED",
		4 : "REJECTED",
		5 : "RETURN TO ADJUST",
		6 : "ACKNOWLEDGED",
		7 : "CANCLED",
		8 : "PREAPPROVE1",
		9 : "PREAPPROVE2"

	},
	approver_choices : [
		{"id":"1", "name": "อนุมัติ", "value":"3"},
		{"id":"2", "name": "ไม่อนุมัติ", "value":"4"},
		{"id":"3", "name": "กลับไปแก้ไข", "value":"5"}

	],
	getApproveChoice : function(value)
	{
		for(var i =0; i < approver_choices.length; i++)	
		{
			if(approver_choices[i].value == value)
				return approver_choices[i]
		}
		return null;
	},
	LEAVE_DENIED_ACCESS_MESSAGE :
	{
		"CANCLED":"ใบลาถูกยกเลิกโดยเจ้าของแล้ว"
	},
	DONT_FORGET :{
		APPROVE : "กรณาเลือกว่าจะ อนุมัติ ไม่อนุมัติ หรือ กลับไปแก้ไข"

	}

}

angular.module("sick",['ui.bootstrap', 'leave.controller', 'ngRoute', 'approve.controller'])
	.config(["$routeProvider", function ($routeProvider){
		$routeProvider.
			when('/', {
				templateUrl:'create.html',
				controller:'LeaveCtrl'
			}).
			when('/read/:id', {
				templateUrl:"read.html",
				controller:"LeaveReadCtrl"
			}).
			when('/other', {
				templateUrl:'create-other.html',
				controller:'LeaveOtherCtrl'
			}).
			when('/approve', {
				templateUrl:"approvelist.html",
				controller:"ApproveIndexCtrl"
			}).
			when('/list', {
				templateUrl:"leavelist.html",
				controller:"LeaveIndexCtrl"

			})
			.
			when('/cancle', {
				templateUrl:"canclelist.html",
				controller:"CancleIndexCtrl"

			})
			.when('/cancle/create/:id', {
				templateUrl:"create-cancle.html",
				controller:"CancleCreateCtrl"
			})
	}])

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
					//console.log( (leaveItem.TotalQty -  leaveItem.Used) )
					extra +=  (leaveItem.TotalQty -  leaveItem.Used)
				}
				if(leaveItem != null && (leaveItem.TotalQty -  leaveItem.Used) < left)
					return Config.errorText;
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
		//var period_holidays = [0, 6];
		
		return function (date_time_from, date_time_to, holiday_list, period_holidays)
		{
			if(angular.isUndefined(period_holidays))
				period_holidays = [0, 6];
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
			console.log('period_holidays :' + holiday_date + " / " + JSON.stringify(period_holidays));
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
				if(time_from.getHours() <= 12 && time_to.getHours() >= 13)
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
				console.log('check sick')
				console.log(selectedType.LeaveType)
				console.log(types[0].value)
				if(selectedType.LeaveType == types[0].value)
					return true;
				return false;
			},
			isWorkLeave : function(selectedType)
			{
				if(selectedType.LeaveType == types[1].value)
					return true;
				return false;	
			},
			isHolidayLeave : function(selectedType)
			{
				console.log('check holiday')
				console.log(selectedType)
				if(selectedType.LeaveType == types[2].value)
					return true;
				return false;
			},

			get : function()
			{
				return types;
			},
			getCancle : function()
			{
				return Config.cancleLeaveTypes;
			},
			find : function(type)
			{
				for(var i =0; i < types.length; i++)
					if(type == types[i].value)
						return types[i];
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
	.filter("cancleType", ["LeaveTypes", function(LeaveTypes){
		return function (type)
		{
			var types = LeaveTypes.getCancle();
			var answers = [];
				for(var i = 0; i < types.length; i++)
				{
					answers[types[i]["from"]] = types[i]["name"]
				}
			return answers[type];
		}
	}])
	.filter("cancleTypeID", ["LeaveTypes", function(LeaveTypes){
		return function (type)
		{
			var types = LeaveTypes.getCancle();
			var answers = [];
				for(var i = 0; i < types.length; i++)
				{
					answers[types[i]["from"]] = types[i]["value"]
				}
			return answers[type];
		}
	}])

	.filter("isFromMainSite", function(){
		return function (user)
		{
			return user.Site == Config.mainSite;
		}
	})
	.filter('filterHolidayList', ['$filter', function ($filter){
			return function (holidays, site, value)
			{
				if(angular.isUndefined(site))
					site = Config.mainSite
				if(angular.isUndefined(value))
					value = "1";
				console.log('gonna filter')
				var obj = {}
				obj[site] = value
				console.log(obj)
				var _holidays = $filter('filter')(holidays, obj);
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
	.filter("sqlToJsTime", function(){
		return function (sqlTime)
		{
			var raw = sqlTime.split(":");
			var d = new Date();
			d.setHours(raw[0])
			d.setMinutes(raw[1])
			d.setSeconds(raw[2])
			return d;
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
	.filter("checkPassMinimum", function() {
		return function (time_used, type )
		{
			var minimum = Config.mininumLeaves[type]
			if(angular.isNumber(minimum))
			{
				if(time_used >= minimum)
					return {status:true, message:"pass"};
				else
					return {status:false, message:"not pass", minimum:minimum}
			}else
				return {status:true, message:"no minimum setting on this type"}
		}
	})
	.filter("minimumStatus", ["$filter", function ($filter){
		return function (time_used, type)
		{
			var result = $filter("checkPassMinimum")(time_used, type);
			if(!result.status)
				return "ต้องลาขั้นต่ำ " + result.minimum + " นาที"
			else
				return "";
		}
	}])
	.filter("canEditForm", function() {
		return function (status)
		{

			if(status == Config.STATUS.DRAFT || status == Config.STATUS.REJECTED)
				return true;
			return false;
		}

	})
	.filter("getLeaveStatus", function(){
		return function (status) {
			// body...
			//console.log(Config.status_names)
			//console.log(status)
			return Config.status_names[status];
		}
	})
	.filter('isCantCancle', function() {
		return function (leaveType)
		{
			if(leaveType == Config.STATUS.REJECTED || leaveType == Config.STATUS.APPROVED)
				return true;
			return false;
		}
	})
	.filter('isCantSend', function() {
		return function (leaveType)
		{
			if(leaveType == Config.STATUS.SENDED)
				return true;
			return false;
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
			lastId : function(table, params, callback)
			{
				var url = $filter('http_request_url')("last_id", table ,params)
				$http.get(url).success(callback);
			},
			create : function(table, params, callback)
			{
				$http.post(SERVICE_PATH, {table:table, action:"create", params:params}).success(callback);
			},
			update : function(table, params, callback)
			{
				if(angular.isUndefined(params.condition))
					$http.post(SERVICE_PATH, {table:table, action:"update", params:params}).success(callback);
				else
				{
					var cond = params.condition
					delete(params.condition)
					$http.post(SERVICE_PATH, {table:table, action:"update", params:params, condition:cond}).success(callback);
				}
			},
			getUser : function(callback)
			{
				var url = $filter('http_request_url')("user", "test", {});
				$http.get(url).success(callback);
			},
			getApproveStatus : function(params, callback)
			{
				var url = $filter('http_request_url')("approve_status", "nope" ,params)
				$http.get(url).success(callback);

			},
			approve : function(params, callback)
			{
				var url = $filter('http_request_url')("approve", "l_approvetrans" ,params)
				$http.get(url).success(callback);
			},
			fetchApproveRequests :function (params, callback) {
				// body...
				var url = $filter('http_request_url')("fetch_approve_requests", "nope" ,params)
				$http.get(url).success(callback);
			},


			getApproverApproveStatus : function(params, callback)
			{
				var url = $filter('http_request_url')("get_approve_status", "nope" ,params)
				$http.get(url).success(callback);
			}

		}
	}] )
	.factory("Config", function(){
		return Config;
	})
	