<template>
  <MoDocPage title="投诉与举报">

<p>如果你认为蚁阅上发布的内容侵犯了你的合法权益，或者发现违法和不良信息，请通过邮件联系我们。我们会核实并处理。</p>
<h2>投诉邮箱</h2>
<div class="email-card"><span>guyskk@anyant.com</span><a class="send" href="mailto:guyskk@anyant.com?subject=%E6%8A%95%E8%AF%89%2F%E4%B8%BE%E6%8A%A5%EF%BC%9A">发送邮件</a></div>
<p>主题建议：投诉/举报：简要说明</p>
<h2>请在邮件中写明</h2>
<ol>
<li>你的姓名（或名称）和联系方式；</li>
<li>被投诉内容的完整链接（发布页地址）；</li>
<li>投诉事项和理由；</li>
<li>权属证明或侵权事实的初步材料（如适用）；</li>
<li>你确认以上内容真实的声明。</li>
</ol>
<p>信息越完整，处理越快。</p>
<h2>处理时限</h2>
<ul>
<li>我们会在收到邮件后 3 个工作日内确认收到；</li>
<li>一般在 7 个工作日内完成核实和处理；</li>
<li>情况复杂需要延长的，会告知你预计时间。</li>
</ul>
<h2>我们会怎么处理</h2>
<ol>
<li>核实你提供的信息和链接；</li>
<li>内容确实违法或侵权的，删除相关内容或断开访问；</li>
<li>必要时把投诉事项转告发布者，请其说明；不会转交你的联系方式，除非你同意或法律要求；</li>
<li>把处理结果回复给你；</li>
<li>保留投诉邮件和处理记录。</li>
</ol>
<h2>如果你是发布者</h2>
<p>如果你认为处理有误，可以回复同一邮件提交反通知，说明理由并提供材料，我们会复核。</p>
<h2>账号和数据请求</h2>
<p>查询、更正、删除个人信息或注销账号，也可以发到这个邮箱；我们会在 15 个工作日内处理。</p>
<h2>请勿恶意投诉</h2>
<p>恶意投诉、伪造材料给他人造成损失的，依法承担责任。</p>
  </MoDocPage>
</template>

<script>
import MoDocPage from '@/components/MoDocPage'

export default {
  name: 'MoComplaintPage',
  components: { MoDocPage },
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.email-card {
  margin: 10 * @pr 0 6 * @pr;
  padding: 12 * @pr 14 * @pr;
  background: @antBackGrey;
  border: 1px solid @antLineGrey;
  border-radius: 6 * @pr;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 18 * @pr;
  font-weight: bold;
  color: @antTextBlack;
  word-break: break-all;

  .send {
    flex-shrink: 0;
    margin-left: 12 * @pr;
    padding: 6 * @pr 12 * @pr;
    border: 1px solid @antGreen;
    border-radius: 4 * @pr;
    color: @antGreen;
    font-size: 14 * @pr;
    font-weight: normal;
    text-decoration: none;
    white-space: nowrap;
  }
}
</style>
