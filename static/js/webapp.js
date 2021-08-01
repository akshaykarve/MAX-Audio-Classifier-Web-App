/*
 * Copyright 2018 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-env jquery */
/* eslint-env browser */

'use strict';

// canvas colors
const COLOR_NORMAL = '#00FF00'; // Lime
const COLOR_HIGHLIGHT = '#FFFFFF'; // White
const COLOR_TEXT = '#000000'; // Black

// global vars
var threshold = 0.2;
//var highlight = '';
//var filter_list = [];
var predictions = [];

// Handle Audio File Upload
function handleFiles(event) {
  var files = event.target.files;
  predictions = [];
  clearTable();
  $("#src").attr("src", URL.createObjectURL(files[0]));  
  document.getElementById("audio").load();
}

/////// Don't need the functions for canvas!!! UPDATE LATER

// Take uploaded image, display to canvas and run model
function submitAudioInput(event) {

  if($('#upload').val() !== ''){
    event.preventDefault();

    var form = event.target;
    var file = form[0].files[0];
    var data = new FormData();
    data.append('audio',file);
    data.append('start_time', 0);
    predictions = []; // remove any previous metadata
    sendAudio(data);
  }
}

// Send image to model endpoint
function sendAudio(data) {
  $('#file-submit').text('Detecting...');
  $('#file-submit').prop('disabled', true);

  // Perform file upload
  $.ajax({
    url: 'http://max-audio-classifier.codait-prod-41208c73af8fca213512856c7a09db52-0000.us-east.containers.appdomain.cloud/model/predict',
    method: 'post',
    processData: false,
    contentType: false,
    data: data,
    dataType: 'json',
    success: function(data) {
      predictions = data['predictions'];
      // Show predicitions on table
      if (predictions.length === 0) {
        alert('No Sounds Identified!');
      } else {
        loadTable(threshold);
      }
    },
    error: function(jqXHR, status, error) {
      alert('Audio Detection Failed: ' + jqXHR.responseText);
    },
    complete: function() {
      $('#file-submit').text('Submit');
      $('#file-submit').prop('disabled', false);
      $('#file-input').val('');
    },
  });
}

function loadTable(threshold){
  // console.log("Loading Table with threshhold" + threshold);
  var tbody = document.getElementById("tbody");
  if(tbody !== null){
    var count = 1;
    predictions.forEach(element => {
      // console.log(element);
      if(element['probability'] > threshold){
        var newRow = tbody.insertRow();
        var newCell = newRow.insertCell();
        var newText = document.createTextNode(count.toString());
        newCell.appendChild(newText);
        $.each(element, (key,data) => {
          // console.log(data);
          newCell = newRow.insertCell();
          newText = document.createTextNode(data.toString());
          newCell.appendChild(newText);
        })
        count++;
      }
    });
  }
}

function clearTable(){
  var tbody = document.getElementById("tbody");
  tbody.innerHTML = "";
}

// Run or bind functions on page load
$(function() {
  // Update canvas when window resizes
  $(window).resize(function(){
    // paintCanvas();
  });

  // document.getElementById("upload").addEventListener("change", handleFiles, false);
  $('#upload').on('change', handleFiles);
  // Image upload form submit functionality
  $('#file-upload').on('submit', submitAudioInput);

  // Enable webcam
  // $('#webcam-btn').on('click', runWebcam);

  // Update threshold value functionality
  $('#threshold-range').on('input', function() {
    $('#threshold-text span').html(this.value);
    threshold = $('#threshold-range').val() / 100;
    clearTable();
    loadTable(threshold);
  });

  // Populate the label icons on page load
  // $.get('/model/labels', function(result) {
  //   $.each(result['labels'], function(i, label) {
  //     $('#label-icons').append($('<img>', {
  //       class: 'label-icon',
  //       id: 'label-icon-' + label.id,
  //       title: label.name,
  //       src: '/img/cocoicons/' + label.id + '.jpg',
  //     }));
  //   });

  //   // Add an "onClick" for each icon
  //   $('.label-icon').on('click', function() {
  //     var this_id = $(this).attr('id').match(/\d+$/)[0];
  //     if ($(this).hasClass('hide-label')) {
  //       $(this).removeClass('hide-label');
  //       filter_list.splice(filter_list.indexOf(this_id), 1);
  //     } else {
  //       $(this).addClass('hide-label');
  //       filter_list.push(this_id);
  //     }
  //     paintCanvas();
  //   });

  //   // Add mouse over for each icon
  //   $('.label-icon').hover(function() {
  //     highlight = $(this).attr('id').match(/\d+$/)[0];
  //     paintCanvas();
  //   }, function() {
  //     highlight = '';
  //     paintCanvas();
  //   });
  // });
});
