angular.module("leave.controller", ['sick.model', 'sick.filter'])
	.controller('LeaveCtrl', ["$scope", "$filter", "Query", "LeaveTypes", "$location" , function  ($scope, $filter, Query, LeaveTypes, $location) {
		// body...
		$scope.user;
		$scope.leaves;
		$scope.holidays;
		$scope.leave_types = LeaveTypes.getNormal();
		$scope.selectedType = null;
		$scope.minDate = new Date();
		$scope.minDate.setDate($scope.minDate.getDate() + 1)
		$scope.maxDate = null;
		$scope.type;
		$scope.min_time = new Date();
		$scope.min_time.setHours(8);
		$scope.min_time.setMinutes(0);
		$scope.min_time.setSeconds(0);
		$scope.max_time = new Date();
		$scope.max_time.setHours(17);
		$scope.max_time.setMinutes(0);
		$scope.max_time.setSeconds(0);

		$scope.mytime = angular.copy($scope.min_time)
		$scope.mytime2= angular.copy($scope.max_time)
		$scope.time_used = 0;
		$scope.steps = [false, false, false, false];

		/*
		* Happen when change radio type
		*/
		$scope.updateType = function()
		{
			
			if(LeaveTypes.isSickLeave($scope.selectedType))
			{
				$scope.minDate = $filter('sqlToJsDate')($scope.selectedType.StartDate);
				
				$scope.maxDate = $filter('sqlToJsDate')($scope.selectedType.EndDate);
				$scope.maxDate = $filter('minDate')($scope.maxDate, new Date())
				$scope.maxDate.setDate($scope.maxDate.getDate() - 7);
			}else if(LeaveTypes.isHolidayLeave($scope.selectedType))
			{
				console.log("is holidays")
				$scope.minDate = new Date()
				$scope.minDate.setDate($scope.minDate.getDate() + 1);
				$scope.maxDate = $filter('sqlToJsDate')($scope.selectedType.EndDate);
			}
			else
			{
				$scope.minDate = new Date();
				$scope.minDate.setDate($scope.minDate.getDate() + 1)
				$scope.minDate = $filter('minDate')($scope.minDate, $filter('sqlToJsDate')($scope.selectedType.StartDate));
				$scope.maxDate = $filter('sqlToJsDate')($scope.selectedType.EndDate);
			}
			$scope.date_time_from = null;
			$scope.date_time_to = null;
			$scope.mytime = angular.copy($scope.min_time)
			$scope.mytime2= angular.copy($scope.max_time)
			$scope.steps = [false, false, false, false];
		}

		/*
		* do this when update 
		*/
		$scope.updateDateTime = function()
		{
			//when update 
			var checker_items = [$scope.mytime, $scope.date_time_from, $scope.date_time_to, $scope.mytime2];
			var shouldCheckTotal = true;
			for(var i =0; i < checker_items.length; i++)
			{
				if( !(typeof(checker_items[i]) != "undefined" && checker_items[i] instanceof Date) )
				{
					shouldCheckTotal = false;
					break;
				}
			}
			if(shouldCheckTotal)
			{
				$scope.time_used = $filter('timeDifferent')($scope.date_time_from, $scope.date_time_to, $scope.mytime, $scope.mytime2);
				
				if($filter('isFromMainSite')($scope.user))
				{
					var holiday_list = $filter('filterHolidayList')($scope.holidays, $scope.user.Site);
					console.log('inverse holiday')
					console.log($filter('filterHolidayList')($scope.holidays, $scope.user.Site, "0"));
					var holiday_usage_days = $filter('timeHoliday')($scope.date_time_from, $scope.date_time_to, holiday_list);
					$scope.time_used -= $filter("daysToMins")(holiday_usage_days) ;

				}else
				{
					console.log('==== branch holiday')
					console.log($scope.holidays)
					var holiday_list = $filter('filterHolidayList')($scope.holidays, "Branch");
					
					console.log(holiday_list);
					var holiday_usage_days = $filter('timeHoliday')($scope.date_time_from, $scope.date_time_to, holiday_list, [0]);
					$scope.time_used -= $filter("daysToMins")(holiday_usage_days) ;					
				}
				

			}
		}
		$scope.init = function()
		{
			Query.getUser(function(current_user){
				Query.get("l_empltable", {"UserID":current_user.user}, function(user){
					$scope.user = user;
					Query.query("l_leavetable", {"EmplID":user.EmplID}, function(leaves){
						$scope.leaves = leaves;
					});
					Query.query("l_holiday", {}, function (holidays){
						console.log(holidays);
						$scope.holidays = holidays;
						
					});
					Query.lastId("l_leavetrans", {"idName":"TransID"}, function (obj){
						$scope.TransID = Number(obj.TransID) ;
					})
				});
			})
			
		}

		$scope.saveForm = function(status)
		{
			var obj = {};
			var result = $filter("checkPassMinimum")($scope.time_used, $scope.selectedType.LeaveType)
			if(!result.status)
			{
				//fail

				return false;
			}
			obj.LeaveTransID = $filter('documentId')($scope.TransID);
			obj.EmplID = $scope.user.EmplID;
			obj.LeaveType = $scope.selectedType.LeaveType;
			obj.CreateDate = $filter('jsDateToSqlDate')(new Date());
			obj.LeaveStartDate = $filter('jsDateToSqlDate')($scope.date_time_from);
			obj.LeaveEndDate = $filter('jsDateToSqlDate')($scope.date_time_to);
			obj.LeaveStartTime = $filter('jsTimeToSqlTime')($scope.mytime);
			obj.LeaveEndTime = $filter('jsTimeToSqlTime')($scope.mytime2)
			obj.Description = $scope.description;
			obj.TotalDay = $filter('leaveDays')($scope.time_used);
			obj.TotalHour = $filter('leaveHours')($scope.time_used);
			obj.TotalMin = $filter('leaveMinutes')($scope.time_used);
			obj.Status = status;
			console.log(obj);

			Query.create('l_leavetrans', obj, function (data){
				console.log('after create')
				console.log(data)
				$location.path("/read/"  + obj.LeaveTransID );
			})
		}

		$scope.init();
		
	}])
	.controller('LeaveReadCtrl', ["$controller", "$scope", "$filter", "$routeParams", "Query", "LeaveTypes", "$location", "Config", function  ($controller, $scope, $filter, $routeParams, Query, LeaveTypes, $location, Config) {
		// body...
		angular.extend(this, $controller('LeaveCtrl', {
			$scope: $scope,
			$filter: $filter, 
			$routeParams: $routeParams, 
			Query: Query, 
			LeaveTypes: LeaveTypes,
			$location: $location,
		}));

		$scope.saveForm = function(status)
		{
			var obj = {};
			var result = $filter("checkPassMinimum")($scope.time_used, $scope.selectedType.LeaveType)
			if(!result.status)
			{
				//fail

				return false;
			}
			obj.LeaveTransID = $filter('documentId')($scope.TransID);
			obj.EmplID = $scope.user.EmplID;
			obj.LeaveType = $scope.selectedType.LeaveType;
			obj.CreateDate = $filter('jsDateToSqlDate')(new Date());
			obj.LeaveStartDate = $filter('jsDateToSqlDate')($scope.date_time_from);
			obj.LeaveEndDate = $filter('jsDateToSqlDate')($scope.date_time_to);
			obj.LeaveStartTime = $filter('jsTimeToSqlTime')($scope.mytime);
			obj.LeaveEndTime = $filter('jsTimeToSqlTime')($scope.mytime2)
			obj.Description = $scope.description;
			obj.TotalDay = $filter('leaveDays')($scope.time_used);
			obj.TotalHour = $filter('leaveHours')($scope.time_used);
			obj.TotalMin = $filter('leaveMinutes')($scope.time_used);
			obj.Status = status;
			console.log(obj);
			obj.condition = "TransID = " + $scope.TransID;
			Query.update('l_leavetrans', obj, function (data){
				console.log('after create')
				console.log(data)
				console.log(status)
				
				if(status == Config.STATUS.CANCLED)
					$location.path("/");
				//else
				//	$location.path("/read/"  + obj.LeaveTransID );
			})
		}
		$scope.approvers = [];
		$scope.approvers_choices =  Config.approver_choices;
		$scope.isOwner = false;
		$scope.checkAccess = function(obj)
		{
			if(obj.Status == Config.STATUS.CANCLED )
			{
				alert(Config.LEAVE_DENIED_ACCESS_MESSAGE.CANCLED)
				$location.path("/");
			}
		}

		$scope.approve = function(approve_item)
		{
			if(!angular.isObject(approve_item.selectedChoice) || approve_item.selectedChoice == null)
				alert(Config.DONT_FORGET.APPROVE)
			else
			{
				alert("approve na")
				console.log(approve_item)
				//could be uupdate
				var approve_obj = {}
				approve_obj.LeaveTransID = $scope.LeaveTransID;
				approve_obj.Approve = approve_item.user.EmplID;
				approve_obj.Status = approve_item.selectedChoice.value;
				approve_obj.Remark = approve_item.mark;

				approve_obj.EmplID = $scope.user.EmplID
				Query.approve( approve_obj, function(data){
					alert(approve_item.selectedChoice.name + "เรียบร้อย");
				})

			}
			
		}

		$scope.loadApprovData = function(index, data_approve)
		{
			
			if(data_approve !== null)
			{
				console.log("---data_approve-- at index " + index)
				console.log(data_approve)
				$scope.approvers[index].mark = data_approve.Remark;
				for(var i =0; i < Config.approver_choices.length ;i++)
				{
					console.log(Config.approver_choices[i].value + "vs " + data_approve.Status + " = " + ($scope.approvers_choices[i].value == data_approve.Status))

					if(Config.approver_choices[i].value == data_approve.Status)
					{

						$scope.approvers[index].selectedChoice = $scope.approvers_choices[i]
						console.log("result at " + i + " should be" + $scope.approvers_choices[i])
						console.log($scope.approvers[index].selectedChoice)
					}
				}
				//approve.disable = true;
			}
		}

		$scope.init = function()
		{

			Query.getUser(function(current_user){	

				Query.query("l_holiday", {}, function (holidays){
						$scope.holidays = holidays;
						Query.get("l_leavetrans", {"LeaveTransID": $routeParams.id}, function (obj){
							$scope.checkAccess(obj);
							$scope.DocStatus = obj.Status;

							Query.get("l_empltable", {"EmplID":obj.EmplID}, function(user){
								$scope.user = user;

								//check owner
								$scope.isOwner = (user.UserID == current_user.user) 

								
								Query.query("l_leavetable", {"EmplID":user.EmplID}, function(leaves){
									$scope.leaves = leaves;				
									
									$scope.LeaveTransID = obj.LeaveTransID;
									$scope.Description = obj.Description;
									
									$scope.date_time_from = $filter("sqlToJsDate")(obj.LeaveStartDate)
									$scope.date_time_to = $filter("sqlToJsDate")(obj.LeaveEndDate)
									$scope.mytime = $filter("sqlToJsTime")(obj.LeaveStartTime)
									$scope.mytime2 = $filter("sqlToJsTime")(obj.LeaveEndTime)
									$scope.steps = [true, true, true, true];
									for(var i =0; i < $scope.leaves.length; i++)
										if($scope.leaves[i].LeaveType == obj.LeaveType)
										{

											console.log('------ choice---- ' + i);
											$scope.selectedType = $scope.leaves[i];
										}
									$scope.updateDateTime();
									$scope.mytime.setMilliseconds($scope.min_time.getMilliseconds())
									$scope.mytime2.setMilliseconds($scope.max_time.getMilliseconds())

									//fetch approve data
									Query.get("l_approverlist", {"EmplID":user.EmplID}, function (data){
										if(data.Approver1 != null)
										{
											$scope.approvers[0] = {show:true, disable:false, id:"1"}
											
											Query.get("l_empltable", {"EmplID":data.Approver1}, function (approver1)
											{
												$scope.approvers[0].user = approver1;
												
												if(current_user.user == $scope.approvers[0].user.UserID)
												{
													$scope.approvers[0].isApprover = true;

												}else
													$scope.approvers[0].isApprover = false;

											});
											Query.getApproveStatus({LeaveTransID: $scope.LeaveTransID, Approve:data.Approver1}, function(data_approve){
												$scope.loadApprovData(0, data_approve);
											}) 

										}else
											$scope.approvers[0] = {show:false}
										if(data.Approver2 != null)
										{
											$scope.approvers[1] = {show:true, disable:false, id:"2"}
											Query.get("l_empltable", {"EmplID":data.Approver2}, function (approver2)
											{
												$scope.approvers[1].user = approver2;

												if(current_user.user == $scope.approvers[1].user.UserID)
													$scope.approvers[1].isApprover = true;
												else
													$scope.approvers[1].isApprover = false;
											});
											Query.getApproveStatus({LeaveTransID: $scope.LeaveTransID, Approve:data.Approver2}, function(data_approve){
												$scope.loadApprovData(1, data_approve);
											}) 
										}else
											$scope.approvers[1] = {show:false}

										if(data.Approver3 != null)
										{
											$scope.approvers[2] = {show:true, disable:false, id:"3"}
											Query.get("l_empltable", {"EmplID":data.Approver3}, function (approver3)
											{
												$scope.approvers[2].user = approver3;
												if(current_user.user == $scope.approvers[2].user.UserID)
													$scope.approvers[2].isApprover = true;
												else
													$scope.approvers[2].isApprover = false;
											});
											Query.getApproveStatus({LeaveTransID: $scope.LeaveTransID, Approve:data.Approver3}, function(data_approve){
												$scope.loadApprovData(2, data_approve);
											}) 
										}else
											$scope.approvers[2] = {show:false}
									})


								});
								


							});
							
							
						})
					
				});
			});
		}	
		$scope.init();

		
		
	}])