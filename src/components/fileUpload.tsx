import React, { ChangeEvent } from "react";
import {
  Button,
  Stack,
  Box,
  useToast,
  VStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import GlobalContext from "../contextx/globalContext";
import ProtonAbi from "../contracts/Proton.json";
import { ethers } from "ethers";
import { Stage, Image, Layer, Line } from "react-konva";

const protonAddress = "0xD4F7389297d9cea850777EA6ccBD7Db5817a12b2";

const FileUploader = () => {
  const { state } = React.useContext(GlobalContext);
  const [photo, setPhoto] = React.useState<any>();
  const toast = useToast();
  const [autographedImage, setAutographedImage] = React.useState<any>();
  const [tool, setTool] = React.useState("pen");
  const [lines, setLines] = React.useState<any>([]);
  const isDrawing = React.useRef(false);
  const stageRef = React.useRef(null);
  const [stageSize, setSize] = React.useState({
    width: window.innerWidth * .9,
    height: window.innerHeight * .9,
  });
  const [imageSize, setImageSize] = React.useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const { isOpen, onOpen, onClose } = useDisclosure();


  React.useEffect(() => {
    if (photo) {
      let aspectRatio = photo.width / photo.height;
      let stageRatio = stageSize.width / stageSize.height;
      let newSize = stageSize;
      if (aspectRatio >= stageRatio) {
        newSize.height = photo.height / aspectRatio;
      }
      else {
        newSize.width = photo.width * stageRatio;
        newSize.height = photo.height;
      }
      setImageSize(newSize)
      setSize(newSize);
    }
  }, [photo, stageSize]);

  React.useEffect(() => {
    if (photo && photo.width > 0) {
      onOpen();
    }
  },[photo ])

  const handleMouseDown = (e: any) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    //@ts-ignore
    setLines([...lines, { tool, points: [pos.x, pos.y] }]);
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing.current) {
      return;
    }
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    let lastLine = lines[lines.length - 1];

    //@ts-ignore
    lastLine.points = lastLine.points.concat([point.x, point.y]);

    lines.splice(lines.length - 1, 1, lastLine);
    setLines(lines.concat());
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const handleClick = () => {
    var fileInputEl = document.createElement('input');
    fileInputEl.type = 'file';
    fileInputEl.accept = 'image/*';
    fileInputEl.style.display = 'none';
    document.body.appendChild(fileInputEl);
    fileInputEl.addEventListener('input', function (e) {
      handleUpload(e as any);
      document.body.removeChild(fileInputEl);
    });
    fileInputEl.click();
  };

  const handleUpload = async (evt: ChangeEvent<HTMLInputElement>) => {

    let files = evt.target.files;
    let reader = new FileReader();
    if (files && files.length > 0) {
      reader.onload = function () {
        let img = new window.Image();
        //@ts-ignore
        img.src = reader.result;
        setPhoto(img);
      };
      reader.readAsDataURL(files[0]);
    }
  };

  function dataURItoBlob(dataURI: string) {
    // convert base64 to raw binary data held in a string
    var byteString = atob(dataURI.split(",")[1]);

    // separate out the mime component
    var mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];

    // write the bytes of the string to an ArrayBuffer
    var arrayBuffer = new ArrayBuffer(byteString.length);
    var _ia = new Uint8Array(arrayBuffer);
    for (var i = 0; i < byteString.length; i++) {
      _ia[i] = byteString.charCodeAt(i);
    }

    var dataView = new DataView(arrayBuffer);
    var blob = new Blob([dataView], { type: mimeString });
    return blob;
  }

  const autographPhoto = () => {
    //@ts-ignore
    let img = stageRef.current!.toDataURL();
    setAutographedImage(img);
    setPhoto(undefined);
    onClose();
  };

  const uploadPhoto = async () => {
    try {
      let blob = dataURItoBlob(autographedImage);
      if (state.ipfs) {
        let added = await state.ipfs.add(blob, {
          progress: (prog: any) => console.log(`received: ${prog}`),
        });
        let metadata = {
          description: "Test1",
          external_url:
            "http://localhost:8000/go/energize/0xbaa4eCBe6905c0C0841a16853C0B6BD469dF9f9D/{id}",
          animation_url: "",
          youtube_url: "",
          icon: "",
          image: `https://ipfs.io/ipfs/${added.path}`,
          thumbnail: `https://ipfs.io/ipfs/${added.path}`,
          name: "My Test Proton",
          symbol: "PROTON",
          decimals: 18,
          background_color: "FFF",
          attributes: [
            { name: "Medium", value: "Oil on Canvas" },
            { name: "Dimensions", value: '9" x 12"' },
            { name: "Proof of Ownership", value: "Embedded NFC" },
            { name: "Edition", value: "1 of 1" },
          ],
          creatorAnnuity: 5,
          particleType: "proton",
        };
        added = await state.ipfs.add(JSON.stringify(metadata), {
          progress: (prog: any) => console.log(`received: ${prog}`),
        });
        let tokenUri = `https://gateway.ipfs.io/ipfs/${added.path}`;
        let signer = await state.web3!.getSigner();
        let signerAddress = await signer.getAddress();
        const protonContract = new ethers.Contract(
          protonAddress,
          ProtonAbi,
          signer
        );
        protonContract.functions.createProton(
          signerAddress,
          signerAddress,
          tokenUri,
          5
        );
      }
    } catch (error) {
      console.error(error);
      toast({
        position: "top",
        status: "error",
        title: "Something went wrong",
        description: error.toString(),
        duration: 5000,
      });
    }
    setPhoto(undefined);
  };

  return (
    <Box>
      <Stack align="center">
        <VStack>
          <Button w="200px" onClick={handleClick}>
            Select Image
          </Button>
          <Button w="200px" isDisabled={!autographedImage} onClick={uploadPhoto}>
            Mint NFT
          </Button>
        </VStack>
        <Modal
          onClose={() => {setPhoto(null); onClose()}}
          isOpen={isOpen}
          isCentered
          motionPreset="slideInBottom"
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Sign Below</ModalHeader>
            <ModalCloseButton />
            <ModalBody h="70vh">
              <Stage
                width={
                  photo && photo.width < window.innerWidth
                    ? photo.width
                    : window.innerWidth
                }
                height={
                  photo && photo.height < window.innerHeight
                    ? photo.height
                    : window.innerHeight
                }
                onMouseDown={handleMouseDown}
                onMousemove={handleMouseMove}
                onMouseup={handleMouseUp}
                ref={stageRef}
                onTouchStart={handleMouseDown}
                onTouchMove={handleMouseMove}
                onTouchEnd={handleMouseUp}
              >
                <Layer>
                  <Image image={photo} width={imageSize.width} height={imageSize.height} />
                </Layer>
                <Layer>
                  {lines.map((line: any, i: any) => (
                    <Line
                      key={i}
                      points={line.points}
                      stroke="#df4b26"
                      strokeWidth={5}
                      tension={0.5}
                      lineCap="round"
                      globalCompositeOperation={
                        line.tool === "eraser"
                          ? "destination-out"
                          : "source-over"
                      }
                    />
                  ))}
                </Layer>
              </Stage>
            </ModalBody>
            <ModalFooter>
              <Button onClick={autographPhoto}>Autograph NFT</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Stack>
    </Box>
  );
};

export default FileUploader;
