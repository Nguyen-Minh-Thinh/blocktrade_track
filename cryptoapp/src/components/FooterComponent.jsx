import { Footer } from 'flowbite-react'
import React from 'react'
import { BsDribbble, BsFacebook, BsGithub, BsInstagram, BsTwitter } from "react-icons/bs";
const FooterComponent = () => {
  return (
    <Footer bgDark className='container mx-auto rounded-none bg-transparent'>
      <div className="w-full border border-gray-800">
        <div className="grid w-full items-center grid-cols-3 gap-8 px-6 py-8 md:grid-cols-5">
          <div className=' flex items-center'>
            <img src="/logo.png" alt="" className='w-52'/>
          </div>
          <div>
            <Footer.Title title="Quick Link" />
            <Footer.LinkGroup col>
              <Footer.Link href="#">About Us</Footer.Link>
              <Footer.Link href="#">Feature</Footer.Link>
              <Footer.Link href="#">Career</Footer.Link>
              <Footer.Link href="#">Contact Us</Footer.Link>
            </Footer.LinkGroup>
          </div>
          <div>
            <Footer.Title title="Help" />
            <Footer.LinkGroup col>
              <Footer.Link href="#">Customer Support</Footer.Link>
              <Footer.Link href="#">Terms</Footer.Link>
              <Footer.Link href="#">Privacy</Footer.Link>
              <Footer.Link href="#">FAQs</Footer.Link>
            </Footer.LinkGroup>
          </div>
          <div>
            <Footer.Title title="Others" />
            <Footer.LinkGroup col>
              <Footer.Link href="#">Start Trading</Footer.Link>
              <Footer.Link href="#">Earn Free Crypto</Footer.Link>
              <Footer.Link href="#">Crypto Wallete</Footer.Link>
              <Footer.Link href="#">Payment Option</Footer.Link>
            </Footer.LinkGroup>
          </div>
          <div>
            <p className='text-gray-500 font-medium pb-4'>DOWNLOAD APP</p>
            <img className='mb-4 w-40' src="/GooglePlay.png" alt="" />
            <img className='w-40' src="/AppStore.png" alt="" />
          </div>
        </div>
        <div className="w-full bg-gray-950 border-t border-gray-900 px-4 py-6 sm:flex sm:items-center sm:justify-between">
          <Footer.Copyright href="#" year={2022} />
          <div className="mt-4 flex space-x-6 sm:mt-0 sm:justify-center">
            <Footer.Icon href="#" icon={BsFacebook} />
            <Footer.Icon href="#" icon={BsInstagram} />
            <Footer.Icon href="#" icon={BsTwitter} />
            <Footer.Icon href="#" icon={BsGithub} />
            <Footer.Icon href="#" icon={BsDribbble} />
          </div>
        </div>
      </div>
    </Footer>
  )
}

export default FooterComponent