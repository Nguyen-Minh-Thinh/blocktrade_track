import { Footer } from 'flowbite-react'
import React from 'react'
import { BsDribbble, BsFacebook, BsGithub, BsInstagram, BsTwitter } from "react-icons/bs";
const FooterComponent = () => {
  return (
    <Footer  className='bg-transparent container m-auto'>
      <div className="w-full">
        <div className="grid w-full justify-between sm:flex sm:justify-between md:flex md:grid-cols-1">
          <div>
            <img src="/logo.png" alt="" className='w-32' />
          </div>
          <div className="grid grid-cols-2 gap-8 sm:mt-4 sm:grid-cols-3 sm:gap-6">
            <div>
              <Footer.Title title="about" className='text-white' />
              <Footer.LinkGroup col>
                <Footer.Link href="#" className="text-white">Flowbite</Footer.Link>
                <Footer.Link href="#" className="text-white">Tailwind CSS</Footer.Link>
              </Footer.LinkGroup>
            </div>
            <div>
              <Footer.Title title="Follow us" className='text-white'/>
              <Footer.LinkGroup col>
                <Footer.Link href="#" className="text-white">Github</Footer.Link>
                <Footer.Link href="#" className="text-white">Discord</Footer.Link>
              </Footer.LinkGroup>
            </div>
            <div>
              <Footer.Title title="Legal" className='text-white'/>
              <Footer.LinkGroup col>
                <Footer.Link href="#" className="text-white">Privacy Policy</Footer.Link>
                <Footer.Link href="#" className="text-white">Terms &amp; Conditions</Footer.Link>
              </Footer.LinkGroup>
            </div>
          </div>
        </div>
        <Footer.Divider />
        <div className="w-full sm:flex sm:items-center sm:justify-between">
          <Footer.Copyright href="#" by="BlockTrade Ⓣ" year={2022} />
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