angular.module("sick",['ui.bootstrap'])
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
				/*answers["01"] = "ลาป่วย";
				answers["02"] = "ลากิจ";
				answers["03"] = "ลาพักผ่อน"
				answers["04"] = "ลาคลอด"
				answers["05"] = "ลาบวช"
				answers["06"] = "อื่นๆ"*/
				return answers[type];
			}
		}])
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
	.controller("TestCtrl", ["$scope", "$filter", "Query", "LeaveTypes", function  ($scope, $filter, Query, LeaveTypes) {
		// body...
		$scope.user;
		$scope.leaves;
		$scope.leave_types = LeaveTypes.getNormal();
		$scope.selectedType = null;
		$scope.minDate = new Date();
		$scope.minDate.setDate($scope.minDate.getDate() + 1)
		$scope.maxDate = null;
		$scope.type;
		$scope.min_time = new Date();
		$scope.min_time.setHours(8);
		$scope.min_time.setMinutes(0);
		$scope.max_time = new Date();
		$scope.max_time.setHours(17);
		$scope.max_time.setMinutes(0);

		$scope.mytime = angular.copy($scope.min_time)
		$scope.mytime2= angular.copy($scope.max_time)
		$scope.time_used = 0;
		

		/*
		* Happen when change radio type
		*/
		$scope.updateType = function()
		{
			console.log('update na')
			console.log($scope.selectedType)
			console.log(LeaveTypes.isSickLeave($scope.selectedType) )
			
			if(LeaveTypes.isSickLeave($scope.selectedType))
			{

				$scope.minDate = null;
				$scope.maxDate = new Date();
				$scope.maxDate.setDate($scope.maxDate.getDate() - 7);
			}else
			{
				$scope.minDate = new Date();
				$scope.minDate.setDate($scope.minDate.getDate() + 1)
				$scope.maxDate = null;
			}
			$scope.date_time_from = null;
			$scope.date_time_to = null;
			$scope.mytime = angular.copy($scope.min_time)
			$scope.mytime2= angular.copy($scope.max_time)
		
		}

		/*
		* do this when update 
		*/
		$scope.updateDateTime = function()
		{
			//when update 
			// &&  typeof($scope.date_time_from) != "undefined" && $scope.date_time_from != null && $scope.date_time_from instanceof Date
			console.log("update date time");
			var checker_items = [$scope.mytime, $scope.date_time_from, $scope.date_time_to, $scope.mytime2];
			var shouldCheckTotal = true;
			for(var i =0; i < checker_items.length; i++)
			{
				//console.log('check no ' + i)
				if( !(typeof(checker_items[i]) != "undefined" && checker_items[i] instanceof Date) )
				{
				//	console.log('break at' + i);
					shouldCheckTotal = false;
					break;
				}
			}
			if(shouldCheckTotal)
			{
				/*$scope.date_time_from.setHours($scope.mytime.getHours());
				$scope.date_time_from.setMinutes($scope.mytime.getMinutes());

				$scope.date_time_to.setHours($scope.mytime2.getHours());
				$scope.date_time_to.getMinutes($scope.mytime2.getMinutes());
				*/
				$scope.time_used = $filter('timeDifferent')($scope.date_time_from, $scope.date_time_to, $scope.mytime, $scope.mytime2);
			}
		}

		Query.get("l_empltable", {"UserID":"wanich"}, function(user){
			$scope.user = user;
			Query.query("l_leavetable", {"EmplID":user.EmplID}, function(leaves){
				$scope.leaves = leaves;
			})
		});
		$scope.test = "yo";
	}])