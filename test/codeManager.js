'use strict'
var tape = require('tape')
var init = require('../src/helpers/init')
var txInvokation = require('./resources/contractInvokationTx')
var TestTraceRetriever = require('./TestTraceRetriever')
var contractCode = require('./resources/contractInvokationCode')

tape('CodeManager', function (t) {
  var codeManager
  var context = init.loadContext()
  codeManager = context.codeManager
  context.traceManager.traceRetriever = new TestTraceRetriever()
  codeManager.codeResolver.cacheExecutingCode('0x0d3a18d64dfe4f927832ab58d6451cecc4e517c5', contractCode) // so a call to web3 is not necessary
  context.traceManager.resolveTrace(txInvokation, function (success) {
    if (!success) {
      t.fail(' - traceManager.resolveTrace - failed')
    } else {
      continueTesting(t, codeManager)
    }
  })
})

function continueTesting (t, codeManager) {
  t.test('CodeManager.init', function (st) {
    st.end()
  })

  t.test('CodeManager.resolveStep', function (st) {
    st.plan(6)
    codeManager.register('indexChanged', this, function (index) {
      if (index === undefined || index === null) {
        st.fail(index)
      } else {
        st.ok(index === 6 || index === 0)
      }
    })

    codeManager.register('codeChanged', this, function (code, address, index) {
      console.log(address + ' ' + index + ' ' + code)
      if (!code) {
        st.fail('no codes')
      } else {
        st.ok(address === '0x0d3a18d64dfe4f927832ab58d6451cecc4e517c5' || address === '(Contract Creation - Step 63)')
        if (address === '0x0d3a18d64dfe4f927832ab58d6451cecc4e517c5') {
          console.log(address + ' ' + code[25])
          st.ok(code[25].indexOf('DUP') !== -1)
        } else if (address === '(Contract Creation - Step 63)') {
          console.log(address + ' ' + code[25])
          st.ok(code[25].indexOf('JUMPDEST') !== -1)
        }
      }
    })
    codeManager.resolveStep(0, txInvokation)
    codeManager.resolveStep(70, txInvokation)
  })

  t.test('CodeManager.getInstructionIndex', function (st) {
    st.plan(2)
    codeManager.getInstructionIndex('0x0d3a18d64dfe4f927832ab58d6451cecc4e517c5', 16, function (error, result) {
      console.log(result)
      if (error) {
        st.fail(error)
      } else {
        st.ok(result === 25)
      }
    })

    codeManager.getInstructionIndex('(Contract Creation - Step 63)', 70, function (error, result) {
      console.log(result)
      if (error) {
        st.fail(error)
      } else {
        st.ok(result === 6)
      }
    })
  })
}