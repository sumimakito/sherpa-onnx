if(NOT $ENV{SHERPA_ONNX_IS_USING_BUILD_WASM_SH})
  message(FATAL_ERROR "Please use ./build-wasm-simd-asr.sh to build for wasm ASR")
endif()

if(NOT EXISTS "${CMAKE_CURRENT_SOURCE_DIR}/assets/encoder.onnx")
  message(FATAL_ERROR "Please read ${CMAKE_CURRENT_SOURCE_DIR}/assets/README.md before you continue")
endif()

set(exported_functions
  MyPrint
  # online ASR
  SherpaOnnxCreateOnlineRecognizer
  SherpaOnnxCreateOnlineStream
  SherpaOnnxDecodeOnlineStream
  SherpaOnnxDestroyOnlineRecognizer
  SherpaOnnxDestroyOnlineRecognizerResult
  SherpaOnnxDestroyOnlineStream
  SherpaOnnxDestroyOnlineStreamResultJson
  SherpaOnnxGetOfflineStreamResultAsJson
  SherpaOnnxGetOnlineStreamResult
  SherpaOnnxGetOnlineStreamResultAsJson
  SherpaOnnxIsOnlineStreamReady
  SherpaOnnxOnlineStreamAcceptWaveform
  SherpaOnnxOnlineStreamInputFinished
  SherpaOnnxOnlineStreamIsEndpoint
  SherpaOnnxOnlineStreamReset
  #
)
set(mangled_exported_functions)
foreach(x IN LISTS exported_functions)
  list(APPEND mangled_exported_functions "_${x}")
endforeach()
list(JOIN mangled_exported_functions "," all_exported_functions)

include_directories(${CMAKE_SOURCE_DIR})
set(MY_FLAGS " -s FORCE_FILESYSTEM=1 -s INITIAL_MEMORY=512MB -s ALLOW_MEMORY_GROWTH=1")

if (SHERPA_ONNX_WASM_ASR_EXPORT_ES6)
  string(APPEND MY_FLAGS " -sMODULARIZE=1 -sEXPORT_ES6=1 ")
endif()

if (SHERPA_ONNX_WASM_ASR_EMIT_TSD)
  string(APPEND MY_FLAGS " --emit-tsd sherpa-onnx-wasm-main-asr.d.ts ")
endif()

string(APPEND MY_FLAGS " -sSTACK_SIZE=10485760 ") # 10MB
string(APPEND MY_FLAGS " -sEXPORTED_FUNCTIONS=[_CopyHeap,_malloc,_free,${all_exported_functions}] ")

if (NOT SHERPA_ONNX_WASM_ASR_SKIP_PRELOAD)
  string(APPEND MY_FLAGS "--preload-file ${CMAKE_CURRENT_SOURCE_DIR}/assets@. ")
endif()

string(APPEND MY_FLAGS " -sEXPORTED_RUNTIME_METHODS=['ccall','stringToUTF8','setValue','getValue','lengthBytesUTF8','UTF8ToString'] ")

message(STATUS "MY_FLAGS: ${MY_FLAGS}")

set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} ${MY_FLAGS}")
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} ${MY_FLAGS}")
set(CMAKE_EXECUTABLE_LINKER_FLAGS "${CMAKE_EXECUTABLE_LINKER_FLAGS} ${MY_FLAGS}")

if (NOT CMAKE_EXECUTABLE_SUFFIX STREQUAL ".js")
  message(FATAL_ERROR "The default suffix for building executables should be .js!")
endif()
# set(CMAKE_EXECUTABLE_SUFFIX ".html")

add_executable(sherpa-onnx-wasm-main-asr sherpa-onnx-wasm-main-asr.cc)
target_link_libraries(sherpa-onnx-wasm-main-asr sherpa-onnx-c-api)
install(TARGETS sherpa-onnx-wasm-main-asr DESTINATION bin/wasm/asr)

set(INSTALL_FILES
  "$<TARGET_FILE_DIR:sherpa-onnx-wasm-main-asr>/sherpa-onnx-wasm-main-asr.js"
  "index.html"
  "sherpa-onnx-asr.js"
  "app-asr.js"
  "$<TARGET_FILE_DIR:sherpa-onnx-wasm-main-asr>/sherpa-onnx-wasm-main-asr.wasm"
)

if (SHERPA_ONNX_WASM_ASR_EMIT_TSD)
  list(APPEND INSTALL_FILES "$<TARGET_FILE_DIR:sherpa-onnx-wasm-main-asr>/sherpa-onnx-wasm-main-asr.d.ts")
endif()

if (NOT SHERPA_ONNX_WASM_ASR_SKIP_PRELOAD)
  list(APPEND INSTALL_FILES "$<TARGET_FILE_DIR:sherpa-onnx-wasm-main-asr>/sherpa-onnx-wasm-main-asr.data")
endif()

install(
  FILES ${INSTALL_FILES}
  DESTINATION bin/wasm/asr
)
