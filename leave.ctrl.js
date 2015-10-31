angular.module("leave.controller", ['sick.model', 'sick.filter', 'ngFileUpload'])
	.controller('LeaveCtrl', ["$scope", "$filter", "Query", "LeaveTypes", "$location" , 'Upload', '$timeout', function  ($scope, $filter, Query, LeaveTypes, $location, Upload, $timeout) {
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
		$scope.files =[];
		$scope.errFiles = [];
		$scope.isUploads = [];
		$scope.fileAddress = [];
		/*
		* Happen when change radio type
		*/
		$scope.updateType = function()
		{
			
			if(LeaveTypes.isSickLeave($scope.selectedType))
			{
				$scope.minDate = $filter('sqlToJsDate')($scope.selectedType.StartDate);
				var tmp_date = new Date();
				tmp_date.setDate(tmp_date.getDate() - Config.rangeSickLeave);
				$scope.minDate = $filter("maxDate")($scope.minDate, tmp_date);

				$scope.maxDate = new Date();
				console.log("selected range")
				console.log($scope.minDate)
				console.log($scope.maxDate)
				//$filter('sqlToJsDate')($scope.selectedType.EndDate);
				//var tmp_date = new Date();
				//tmp_date.setDate(tmp_date.getDate() - 7);
				///$scope.maxDate = $filter('minDate')($scope.maxDate, new Date())
				//$scope.maxDate.setDate($scope.maxDate.getDate() - 7);
			}else if(LeaveTypes.isHolidayLeave($scope.selectedType))
			{
				console.log("is holidays")
				$scope.minDate = new Date()
				$scope.minDate.setDate($scope.minDate.getDate() + 1);
				$scope.maxDate = $filter('sqlToJsDate')($scope.selectedType.EndDate);
			}else if(LeaveTypes.isWorkLeave($scope.selectedType))
			{
				$scope.minDate = $filter('sqlToJsDate')($scope.selectedType.StartDate);
				var tmp_date = new Date();
				tmp_date.setDate(tmp_date.getDate() - Config.rangeWorkLeave);
				$scope.minDate = $filter("maxDate")($scope.minDate, tmp_date);
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
		
		$scope.uploadFiles = function(order, file, errFiles) {
	        $scope.files[order] = file;
	        $scope.errFiles[order] = errFiles && errFiles[0];
	        if (file) {
	            file.upload = Upload.upload({
	                url: 'upload.php',
	                data: {file: file, order:order, dir:$scope.uploadDirectory }
	            });

	            file.upload.then(function (response) {
	                $timeout(function () {
	                    file.result = response.data;
	                });
	                $scope.isUploads[order] = true;
	                
	                $scope.fileAddress[order] = response.data.destination;
	                console.log(response);
	                console.log(order);
	            }, function (response) {
	                //if (response.status > 0)
	                  //  $scope.errorMsg = response.status + ': ' + response.data;
	            }, function (evt) {
	                file.progress = Math.min(100, parseInt(100.0 * 
	                                         evt.loaded / evt.total));
	            });
	        }   
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
				console.log("loaded current user")
				console.log(current_user)
				Query.get("l_empltable", {"UserID":current_user.user}, function(user){
					$scope.user = user;
					Query.query("l_leavetable", {"EmplID":user.EmplID, "Status":"A"}, function(leaves){
						$scope.leaves = leaves;
					});
					Query.query("l_holiday", {}, function (holidays){
						console.log(holidays);
						$scope.holidays = holidays;
						
					});
					Query.lastId("l_leavetrans", {"idName":"TransID"}, function (obj){
						$scope.TransID = Number(obj.TransID) ;
						$scope.uploadDirectory = $filter("documentId")($scope.TransID + 1)
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
			obj.LeaveTransID = $filter('documentId')($scope.TransID + 1);
			obj.EmplID = $scope.user.EmplID;
			if($scope.isOther)
				obj.LeaveType = $scope.leaveOtherType ;
			else
				obj.LeaveType = $scope.selectedType.LeaveType;

			obj.CreateDate = $filter('jsDateToSqlDate')(new Date());
			obj.LeaveStartDate = $filter('jsDateToSqlDate')($scope.date_time_from);
			obj.LeaveEndDate = $filter('jsDateToSqlDate')($scope.date_time_to);
			obj.LeaveStartTime = $filter('jsTimeToSqlTime')($scope.mytime);
			obj.LeaveEndTime = $filter('jsTimeToSqlTime')($scope.mytime2)
			obj.Description = $scope.description;
			obj.Subject = $scope.subject;
			obj.TotalDay = $filter('leaveDays')($scope.time_used);
			obj.TotalHour = $filter('leaveHours')($scope.time_used);
			obj.TotalMin = $filter('leaveMinutes')($scope.time_used);

			obj.Status = status;
			if($scope.isUploads[0])
				obj.Attachment1 = $scope.fileAddress[0];
			if($scope.isUploads[1])
				obj.Attachment2 = $scope.fileAddress[1];
			console.log(obj);

			Query.create('l_leavetrans', obj, function (data){
				console.log('after create')
				console.log(data)
				if(obj.Status == Config.STATUS.SENDED)
					alert(Config.MESSAGES.saveForm);
					$location.path("/read/"  + obj.LeaveTransID );
			})
		}

		$scope.init();
		
	}])
	.controller('LeaveOtherCtrl', ["$controller", "$scope", "$filter", "$routeParams", "Query", "LeaveTypes", "$location", "Config", "$route", function  ($controller, $scope, $filter, $routeParams, Query, LeaveTypes, $location, Config, $route) {
		angular.extend(this, $controller('LeaveCtrl', {
			$scope: $scope,
			$filter: $filter, 
			$routeParams: $routeParams, 
			Query: Query, 
			LeaveTypes: LeaveTypes,
			$location: $location,
		}));
		$scope.selectedType = Config.leaveTypes[Config.leaveTypes.length - 1];
		$scope.Config = Config;
		$scope.minDate = new Date();
		
		$scope.updateOtherType = function()
		{
			console.log('update other')
			console.log($scope.selectedOtherType)
			$scope.minDate = new Date();
			$scope.minDate.setDate($scope.minDate.getDate() + 1)

			if($scope.selectedOtherType.value == Config.leavePregnantType)
			{
				$scope.maxDate = new Date();
				$scope.maxDate.setDate($scope.minDate.getDate() + $scope.selectedOtherType.maxCount);
			}else if($scope.selectedOtherType.value == Config.leaveMonkType)
			{
				var user_start_date = $filter('sqlToJsDate')($scope.user.StartDate);
				var current_date = new Date();
				var diff_second = (current_date.getTime() - user_start_date.getTime())/1000;
				var diff_year = Math.floor(diff_second / 60 / 60 / 24 /365) 
				if(diff_year < $scope.selectedOtherType.minWorkYears)
				{
					alert($scope.selectedOtherType.alertMessage)
					$scope.selectedOtherType = null;
				}else
					console.log('diff_year ' + diff_year)
			}
				
			
			$scope.date_time_from = null;
			$scope.date_time_to = null;
			$scope.mytime = angular.copy($scope.min_time)
			$scope.mytime2= angular.copy($scope.max_time)
			
		}

		$scope.saveForm = function(status)
		{
			var obj = {};
			var result;
			
			var result = $filter("checkPassMinimum")($scope.time_used, $scope.selectedType.LeaveType)
			if(!result.status)
			{
				//fail

				return false;
			}
			obj.LeaveTransID = $filter('documentId')($scope.TransID + 1);
			obj.EmplID = $scope.user.EmplID;

			//selectedOtherType

			obj.LeaveType = $scope.selectedOtherType.value;//Config.leaveOtherType;


			obj.CreateDate = $filter('jsDateToSqlDate')(new Date());
			obj.LeaveStartDate = $filter('jsDateToSqlDate')($scope.date_time_from);
			obj.LeaveEndDate = $filter('jsDateToSqlDate')($scope.date_time_to);
			obj.LeaveStartTime = $filter('jsTimeToSqlTime')($scope.mytime);
			obj.LeaveEndTime = $filter('jsTimeToSqlTime')($scope.mytime2)
			obj.Description = $scope.description;
			obj.Subject = $scope.subject;
			obj.TotalDay = $filter('leaveDays')($scope.time_used);
			obj.TotalHour = $filter('leaveHours')($scope.time_used);
			obj.TotalMin = $filter('leaveMinutes')($scope.time_used);

			obj.Status = status;
			if($scope.isUploads[0])
				obj.Attachment1 = $scope.fileAddress[0];
			if($scope.isUploads[1])
				obj.Attachment2 = $scope.fileAddress[1];
			console.log(obj);

			Query.create('l_leavetrans', obj, function (data){
				console.log('after create-other')
				console.log(data)
				if(obj.Status == Config.STATUS.SENDED)
					alert(Config.MESSAGES.saveForm);
				$location.path("/read/"  + obj.LeaveTransID );
			})
		}

	}])
	.controller('LeaveReadCtrl', ["$controller", "$scope", "$filter", "$routeParams", "Query", "LeaveTypes", "$location", "Config", "$route", function  ($controller, $scope, $filter, $routeParams, Query, LeaveTypes, $location, Config, $route) {
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
			var result;
			//var result = $filter("checkPassMinimum")($scope.time_used, $scope.selectedType.LeaveType)
			if(!$scope.isOther)
				result = $filter("checkPassMinimum")($scope.time_used, $scope.selectedType.LeaveType)
			else
			{

				result = $filter("checkPassMinimum")($scope.time_used, Config.leaveOtherType)
			}
			
			if(!result.status)
			{
				//fail

				return false;
			}
			obj.LeaveTransID = $filter('documentId')($scope.TransID);
			obj.EmplID = $scope.user.EmplID;

			if(!$scope.isOther)
				obj.LeaveType = $scope.selectedType.LeaveType;

			else

				obj.LeaveType = Config.leaveOtherType

			obj.Subject = $scope.subject;
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
			if($scope.isUploads[0])
				obj.Attachment1 = $scope.fileAddress[0];
			if($scope.isUploads[1])
				obj.Attachment2 = $scope.fileAddress[1]
			obj.condition = "TransID = " + $scope.TransID;
			Query.update('l_leavetrans', obj, function (data){
				console.log('after create')
				console.log(data)
				console.log(status)
				
				if(status == Config.STATUS.CANCLED)
					$location.path("/");
				else
					$route.reload();
					//$location.path("/read/"  + obj.LeaveTransID );
			})
		}
		$scope.approvers = [];
		$scope.approvers_choices =  Config.approver_choices;
		$scope.isOwner = false;
		$scope.hr = null;
		$scope.checkAccess = function(obj)
		{
			if(obj.Status == Config.STATUS.CANCLED )
			{
				alert(Config.LEAVE_DENIED_ACCESS_MESSAGE.CANCLED)
				$location.path("/");
			}
		}

		$scope.approve = function(approve_item, isHr)
		{
			if(!angular.isObject(approve_item.selectedChoice) || approve_item.selectedChoice == null)
				alert(Config.DONT_FORGET.APPROVE)
			else
			{
				//alert("approve na")
				console.log(approve_item)
				//could be uupdate
				var approve_obj = {}
				approve_obj.LeaveTransID = $scope.LeaveTransID;
				approve_obj.Approve = approve_item.user.EmplID;
				
					approve_obj.Status = approve_item.selectedChoice.value;
				if(angular.isString(approve_item.mark))
					approve_obj.Remark = approve_item.mark;
				else
					approve_obj.Remark = "";

				approve_obj.EmplID = $scope.user.EmplID
				Query.approve( approve_obj, function(data){
					alert(approve_item.selectedChoice.name + Config.MESSAGES.suffixApprove);
					//change path to
					//$route.reload();
					$location.path('/approve');
				})

			}
			
		}




		$scope.canEdit = false;
		$scope.loadApprovData = function(index, data_approve)
		{
			
			if(data_approve !== null && index > 0 && angular.isUndefined( $scope.approvers[index -1].selectedChoice ))
			{
				$scope.approvers[index].disable = true;
			}

			if(index == 0 && (angular.isUndefined(data_approve.Status)  || data_approve.Status == Config.STATUS.SENDED))
			{
				console.log("should be able to edit")
				$scope.canEdit = true;
			}
			
			if(data_approve !== null)
			{
				console.log("---data_approve-- at index " + index)
				
				$scope.approvers[index].mark = data_approve.Remark;
				for(var i =0; i < Config.approver_choices.length ;i++)
				{
					console.log(Config.approver_choices[i].value + "vs " + data_approve.Status + " = " + ($scope.approvers_choices[i].value == data_approve.Status))
					//if older one dont activate make it disable
					
					if(Config.approver_choices[i].value == data_approve.Status)
					{

						$scope.approvers[index].selectedChoice = $scope.approvers_choices[i]
						console.log("result at " + i + " should be" + $scope.approvers_choices[i])
						console.log($scope.approvers[index].selectedChoice)
					}
				}
				if(data_approve.Status == Config.STATUS.APPROVED)
					$scope.approvers[index].disable = true;


				if(angular.isUndefined($scope.approvers[index].selectedChoice) ||$scope.approvers[index].selectedChoice.value != Config.STATUS.APPROVED)
					$scope.hr.disable = true;
				//check if all aprrove

			}else
				$scope.approvers[index].show = false;
		}

		$scope.init = function()
		{

			
			Query.getUser(function(current_user){	

				Query.query("l_holiday", {}, function (holidays){
						$scope.holidays = holidays;
						Query.get("l_leavetrans", {"LeaveTransID": $routeParams.id}, function (obj){
							console.log('l_leavetrans')
							console.log(obj)
							$scope.checkAccess(obj);
							$scope.DocStatus = obj.Status;
							$scope.DocLeaveType = obj.LeaveType;
							$scope.isCantCancle = $filter('isCantCancle')(obj.LeaveType);
							$scope.isCantSend = $filter('isCantSend')(obj.Status);
							$scope.description = obj.Description;
							Query.get("l_empltable", {"EmplID":obj.EmplID}, function(user){
								$scope.user = user;
								console.log('after loaded l_empltable')
								console.log(user);
								//check owner
								$scope.isOwner = (user.UserID == current_user.user) 
								$scope.isActualOwner = (user.UserID == current_user.user) 
								if($scope.isOwner)
									$scope.isOwner = $filter('canEditForm')(obj.Status);
								console.log('gonna do l_leavetable' + user.EmplID)
								console.log(user)
								
								Query.query("l_leavetable", {"EmplID":user.EmplID, "Status":"A"}, function(leaves){
									$scope.leaves = leaves;				
									
									$scope.LeaveTransID = obj.LeaveTransID;
									$scope.Description = obj.Description;
									$scope.uploadDirectory = $scope.LeaveTransID;//for upload
									$scope.date_time_from = $filter("sqlToJsDate")(obj.LeaveStartDate)
									$scope.date_time_to = $filter("sqlToJsDate")(obj.LeaveEndDate)
									$scope.mytime = $filter("sqlToJsTime")(obj.LeaveStartTime)
									$scope.mytime2 = $filter("sqlToJsTime")(obj.LeaveEndTime)
									if(obj.Attachment1 != null)
									{
										$scope.fileAddress[0] = obj.Attachment1;
										$scope.isUploads[0] = true;
									}
									if(obj.Attachment2 != null)
									{
										$scope.fileAddress[1] = obj.Attachment2;
										$scope.isUploads[1] = true;
									}
									$scope.steps = [true, true, true, true];
									//
									$scope.isOther = false;
									if(obj.LeaveType == Config.leaveOtherType || obj.LeaveType == Config.leavePregnantType || obj.LeaveType == Config.leaveMonkType)
									{
										
										$scope.Config = Config;
										$scope.isOther = true;
										console.log("other---type---")
										for(var i=0; i < Config.leaveOtherTypes.length; i++)
										{
											console.log(Config.leaveOtherTypes[i])
											if(Config.leaveOtherTypes[i].value == obj.LeaveType)
												$scope.selectedOtherType = Config.leaveOtherTypes[i];
										}

										$scope.subject = obj.Subject;
									}else
									{
										for(var i =0; i < $scope.leaves.length; i++)
											if($scope.leaves[i].LeaveType == obj.LeaveType)
											{

												console.log('------ choice---- ' + i);
												$scope.selectedType = $scope.leaves[i];
											}
										
									}

									
									$scope.updateDateTime();
									$scope.mytime.setMilliseconds($scope.min_time.getMilliseconds())
									$scope.mytime2.setMilliseconds($scope.max_time.getMilliseconds())

									//fetch approve data
									Query.get("l_approverlist", {"EmplID":user.EmplID}, function (data){
										if(data.Approver1 != null && data.Approver1 != "")
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
										if(data.Approver2 != null && data.Approver2!="")
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

										if(data.Approver3 != null && data.Approver3!="")
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

										if(data.HRID != null)
										{
											var now = new Date();
											$scope.hr = {show:true, disable:false, knownDate:now, selectedChoice:{name:"รับทราบ"}, mark:"" }
											Query.get("l_empltable", {"EmplID":data.HRID}, function (hr)
											{
												$scope.hr.user = hr;
												;
												if(current_user.user == $scope.hr.user.UserID)
													$scope.hr.isHr = true;
												else
													$scope.hr.isHr= false;				
												console.log("hr")
												console.log($scope.hr)
												console.log("user")
												console.log(current_user)
												console.log((current_user.user == $scope.hr.user.UserID))
												Query.getApproveStatus({LeaveTransID: $scope.LeaveTransID, Approve:data.HRID}, function(data_approve){
													if(data_approve.Status == Config.STATUS.ACKNOWLEDGED)
													{
														$scope.hr.disable = true;
														$scope.hr.selectedChoice.value = Config.STATUS.ACKNOWLEDGED
													}else
														$scope.hr.selectedChoice.value = Config.STATUS.DRAFT
												}) 
											});

											
										}
											
									})


								});
								


							});
							
							
						})
					
				});
			});
		}	
		$scope.init();

		
		
	}])
	.controller("CancleCreateCtrl",  ["$controller", "$scope", "$filter", "$routeParams", "Query", "LeaveTypes", "$location", "Config", "$route", function  ($controller, $scope, $filter, $routeParams, Query, LeaveTypes, $location, Config, $route){

		angular.extend(this, $controller('LeaveReadCtrl', {
			$scope: $scope,
			$filter: $filter, 
			$routeParams: $routeParams, 
			Query: Query, 
			LeaveTypes: LeaveTypes,
			$location: $location,
		}));
		$scope.selectedType = Config.leaveTypes[Config.leaveTypes.length - 1];
		$scope.Config = Config;
		
		$scope.saveForm = function()
		{
			var obj = {};
			var result;
			
			obj.LeaveTransID = $scope.LeaveTransID;
			obj.EmplID = $scope.user.EmplID;

			obj.LeaveType = $scope.selectedType.LeaveType//Config.leaveOtherType;

			obj.CreateDate = $filter('jsDateToSqlDate')(new Date());
			obj.LeaveStartDate = $filter('jsDateToSqlDate')($scope.date_time_from);
			obj.LeaveEndDate = $filter('jsDateToSqlDate')($scope.date_time_to);
			obj.LeaveStartTime = $filter('jsTimeToSqlTime')($scope.mytime);
			obj.LeaveEndTime = $filter('jsTimeToSqlTime')($scope.mytime2)
			obj.Description = $scope.description;
			obj.Subject = $scope.subject;
			obj.TotalDay = $filter('leaveDays')($scope.time_used);
			obj.TotalHour = $filter('leaveHours')($scope.time_used);
			obj.TotalMin = $filter('leaveMinutes')($scope.time_used);
			obj.Status = Config.STATUS.SENDED;

			Query.create('l_cancle_leavetrans', obj, function (data){
				console.log('after create-other')
				console.log(data)
				if(obj.Status == Config.STATUS.SENDED)
					alert(Config.MESSAGES.saveForm);
				$location.path("/cancle");
			})
		}

		$scope.init = function()
		{

			
			Query.getUser(function(current_user){	

				Query.query("l_holiday", {}, function (holidays){
						$scope.holidays = holidays;
						Query.get("l_leavetrans", {"LeaveTransID": $routeParams.id}, function (obj){
							$scope.checkAccess(obj);
							
							$scope.DocLeaveType = obj.LeaveType;
							$scope.isCantCancle = $filter('isCantCancle')(obj.LeaveType);
							$scope.isCantSend = $filter('isCantSend')(obj.Status);
							$scope.description = obj.Description;
							Query.get("l_empltable", {"EmplID":obj.EmplID}, function(user){
								$scope.user = user;
								//check owner
								$scope.isOwner = (user.UserID == current_user.user) 
								$scope.isActualOwner = (user.UserID == current_user.user) 
								if($scope.isOwner)
									$scope.isOwner = $filter('canEditForm')(obj.Status);
								
								Query.query("l_leavetable", {"EmplID":user.EmplID, "Status":"A"}, function(leaves){
									$scope.leaves = leaves;				
									
									$scope.LeaveTransID = obj.LeaveTransID;
									$scope.Description = obj.Description;
									$scope.uploadDirectory = $scope.LeaveTransID;//for upload
									$scope.date_time_from = $filter("sqlToJsDate")(obj.LeaveStartDate)
									$scope.date_time_to = $filter("sqlToJsDate")(obj.LeaveEndDate)
									$scope.mytime = $filter("sqlToJsTime")(obj.LeaveStartTime)
									$scope.mytime2 = $filter("sqlToJsTime")(obj.LeaveEndTime)
									if(obj.Attachment1 != null)
									{
										$scope.fileAddress[0] = obj.Attachment1;
										$scope.isUploads[0] = true;
									}
									if(obj.Attachment2 != null)
									{
										$scope.fileAddress[1] = obj.Attachment2;
										$scope.isUploads[1] = true;
									}
									$scope.steps = [true, true, true, true];
									//
									$scope.isOther = false;
									if(obj.LeaveType == Config.leaveOtherType || obj.LeaveType == Config.leavePregnantType || obj.LeaveType == Config.leaveMonkType)
									{
										
										$scope.Config = Config;
										$scope.isOther = true;
										console.log("other---type---")
										for(var i=0; i < Config.leaveOtherTypes.length; i++)
										{
											console.log(Config.leaveOtherTypes[i])
											if(Config.leaveOtherTypes[i].value == obj.LeaveType)
												$scope.selectedOtherType = Config.leaveOtherTypes[i];
										}

										$scope.subject = obj.Subject;
									}else
									{
										for(var i =0; i < $scope.leaves.length; i++)
											if($scope.leaves[i].LeaveType == obj.LeaveType)
											{

												console.log('------ choice---- ' + i);
												$scope.selectedType = $scope.leaves[i];
											}
										
									}

									
									$scope.updateDateTime();
									$scope.mytime.setMilliseconds($scope.min_time.getMilliseconds())
									$scope.mytime2.setMilliseconds($scope.max_time.getMilliseconds())

								});
							});
							
							
						})
					
				});
			});
		}	
		$scope.init();
	}])