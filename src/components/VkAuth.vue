<template>
    <div id="VkIdSdkOneTap"></div>
</template>
<script>
import * as VKID from '@vkid/sdk'

export default {
    name: 'VkAuth',
    props: {},
    mounted(){
        VKID.Config.init({
            app: 53548686,
            redirectUrl: 'https://winfrid.p-host.in/auth',
        });

        const oneTap = new VKID.OneTap();

        const container = document.getElementById('VkIdSdkOneTap');

        if (container) {
            oneTap.render({
                container: container,
                showAlternativeLogin: false
            })
            .on(VKID.WidgetEvents.ERROR, console.warn)
            .on(VKID.OneTapInternalEvents.LOGIN_SUCCESS, function (payload) {
                const code = payload.code;
                const deviceId = payload.device_id;

                VKID.Auth.exchangeCode(code, deviceId)
                .then(console.log)
                .catch(console.error);
            });
        }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
